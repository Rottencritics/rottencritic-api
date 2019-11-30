import { pool } from './database.config'

/**
 * Save review of given film.
 *
 * This will update existing review if it exists. If it does not exist a new
 * review will be created.
 *
 * @param filmId ID of film to review.
 * @param userId ID of reviewer.
 * @param rating the value given to film by reviewer.
 */
export async function saveReview(
  filmId: number,
  userId: number,
  rating: number,
): Promise<Review> {
  console.debug('database.service.saveReview()')

  const res = await pool.query(
    `INSERT INTO reviews (reviewer,film,rating) VALUES ($1,$2,$3)
     ON CONFLICT (reviewer,film) DO UPDATE
      SET rating = EXCLUDED.rating;
     SELECT reviewer,film,rating FROM reviews
      WHERE reviewer=$1 AND film=$2;`,
    [userId, filmId, rating]
  )

  return {
    film: res.rows[0].film,
    rating: res.rows[0].rating,
    reviewer: res.rows[0].reviewer,
  }
}

/**
 * Get film based on IMDB ID.
 * @param imdbId ID of film to retrieve from database.
 */
export async function getFilm(
  imdbId: string,
): Promise<Film> {
  console.debug('database.service.getFilm()')

  const res = await pool.query(
    'SELECT id FROM films WHERE imdbId=$1::text;',
    [imdbId],
  )

  if (res.rows.length === 0) {
    return Promise.reject(`No film in database with imdbId=${imdbId}`)
  }

  return {
    id: res.rows[0].id,
    imdbId,
  }
}

/**
 * Create a record in our database mapping to an IMDB ID.
 * @param imdbId ID of film to create record of in database.
 */
export async function createFilm(
  imdbId: string
): Promise<Film> {
  console.debug('database.service.createFilm()')
  const res = await pool.query(
    'INSERT INTO films (imdbId) VALUES ($1::text) RETURNING id;',
    [imdbId],
  )

  return {
    id: res.rows[0].id,
    imdbId
  }
}

/**
 * Find reviewer by name.
 * @param name to find reviewer by.
 */
export const getReviewersByName = async (name: string): Promise<User> => {
  return pool.query(
    'SELECT * FROM reviewers WHERE name=$1::text;',
    [name],
  ).then((res) => {
    return {
      id: res.rows[0].id,
      password: res.rows[0].password,
      username: res.rows[0].name,
    }
  })
}

/**
 * Get all, full, reviews of a given film.
 * @param imdbId film to get reviews for.
 */
export const loadReviews = async (imdbId: string): Promise<Review[]> => {
  return pool.query(
    `SELECT * FROM reviews WHERE
      film=(SELECT id FROM films WHERE imdbId=$1::text);`,
    [imdbId]
  ).then((res) => {
    const reviews: Review[] = []

    res.rows.forEach((review) => {
      reviews.push({
        film: imdbId,
        rating: review.rating,
        reviewer: review.reviewer,
      })

    })

    return reviews
  })
}
