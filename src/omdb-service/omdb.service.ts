import fetch from 'node-fetch'

const OMDB_API_KEY = process.env.OMDB_API_KEY
const OMDB_BASE_URI = `http://omdbapi.com/?apikey=${OMDB_API_KEY}`

export const fetchFilm = (imdbId: string): Promise<OMDbFilm> => {
  console.debug('omdb.service.fetchFilm()')

  return fetch(`${OMDB_BASE_URI}&i=${imdbId}`)
    .then((res) => res.json())
    .then((res) => {
      if (res.Response !== 'True') {
        return Promise.reject('Given IMDb ID is not valid.')
      }
      return {
        imdbId,
      }
    })
}
