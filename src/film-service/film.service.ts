import {
  createFilm,
  getFilm,
  loadReviews,
  saveReview
} from '../database-service'
import { fetchFilm } from '../omdb-service'

// TODO: replace rating param with complete review
export const reviewFilm = async (
  imdbId: string,
  rating: number,
  userId: number
): Promise<Review> => {
  console.debug('film.service.reviewFilm()')

  let film: Film
  try {
    film = await getFilm(imdbId)
  } catch (_) {
    /**
     * The film does not already exist in our database, so we have to make sure
     * that the IMDb ID is valid by querying OMDb for it. If it exists, we
     * create a new database entry for the film.
     */
    await fetchFilm(imdbId) // Will throw error if invalid.
    film = await createFilm(imdbId)
  }

  return await rateFilm(film, rating, userId)
}

export const getReviews = async (imdbId: string): Promise<Review[]> => {
  return fetchFilm(imdbId) // first we make sure the film actually exist
    .then((_) => {
      return loadReviews(imdbId)
    })
}

const rateFilm = (
  film: Film,
  rating: number,
  userId: number
): Promise<Review> => {
  console.debug('film.service.rateFilm()')

  if (![1, 0, -1].includes(rating)) {
    return Promise.reject(`Invalid rating value: ${rating}`)
  }

  return saveReview(film.id, userId, rating)
}
