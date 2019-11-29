import { createFilm, getFilm, saveReview } from '../database-service'

// TODO: replace rating param with complete review
export async function reviewFilm(imdbId: string, rating: number, userId: number) {
  const film = await getFilm(imdbId)
    // Movie does not exist
    .catch((reason) => {
      console.debug(reason)
      // TODO: First verify that this exists in OMDB API.
      return createFilm(imdbId)
    })

  if (![1, 0, -1].includes(rating)) {
    return Promise.reject(`Invalid rating value: ${rating}`)
  }

  return saveReview(film.id, userId, rating)
}
