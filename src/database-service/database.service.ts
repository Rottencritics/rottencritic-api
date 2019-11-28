import { pool } from './database.config'

/**
 * Save rating of given film.
 *
 * This will update existing review if it exists. If it does not exist a new
 * review will be created.
 *
 * @param filmId ID of film to rate.
 * @param userId ID of reviewer.
 * @param rating the value given to film by reviewer.
 */
export async function rateFilm(
  filmId: number,
  userId: number,
  rating: number,
): Promise<string> {
  const res = await pool.query(
    `INSERT INTO reviews (reviewer,film,rating) VALUES ($1,$2,$3)
     ON CONFLICT (reviewer,film) DO UPDATE
      SET rating = EXCLUDED.rating;`,
    [userId, filmId, rating]
  )

  return res.rows[0]
}

/**
 * Get film based on IMDB ID.
 * @param imdbId ID of film to retrieve from database.
 */
export async function getFilm(
  imdbId: string,
): Promise<Film> {
  const res = await pool.query(
    'SELECT id FROM films WHERE imdbId=$1::text;',
    [imdbId],
  )

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
  const res = await pool.query(
    'INSERT INTO films (imdbId) VALUES ($1::text) RETURNING id;',
    [imdbId],
  )

  return {
    id: res.rows[0].id,
    imdbId
  }
}
