import { createFilm, getFilm, rateFilm } from '../database-service'

export async function likeFilm(imdbId: string, userId: number) {
  const film = await getFilm(imdbId)
    // Movie does not exist
    .catch((reason) => {
      console.debug(reason)
      // TODO: First verify that this exists in OMDB API.
      return createFilm(imdbId)
    })

  return rateFilm(film.id, userId, 1)
}
