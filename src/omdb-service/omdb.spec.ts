import { assert, expect } from 'chai'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'
import { OMDB_BASE_URI, OMDbService } from './omdb.service'

const LE_MANS = 'tt1950186'
const BAD_IMDB_ID = 'tt17'

const omdbService = new OMDbService()

describe('omdb.service.fetchFilm', () => {

  afterEach(fetchMock.reset)

  it('film exists', async () => {
    fetchMock.get(`${OMDB_BASE_URI}&i=${LE_MANS}`, {
      Response: 'True',
    })

    expect(await omdbService.fetchFilm(LE_MANS)).to.deep.equal({
      imdbId: LE_MANS
    })
  })
  it('film does not exist', () => {
    fetchMock.get(`${OMDB_BASE_URI}&i=${BAD_IMDB_ID}`, {
      Response: 'False',
    })

    omdbService.fetchFilm(BAD_IMDB_ID)
      .then(() => assert.fail('Should throw an error.'))
      .catch((err) => expect(err).to.equal('Given IMDb ID is not valid.'))
  })
})
