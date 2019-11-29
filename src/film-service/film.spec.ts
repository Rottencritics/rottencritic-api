import { expect } from 'chai'
import sinon from 'sinon'
import { DatabasePool, DatabaseService } from '../database-service'
import { OMDbService } from '../omdb-service'
import { FilmService } from './film.service'

const LE_MANS = 'tt1950186'

const omdbService = new OMDbService()
const databasePool = new DatabasePool()
const databaseService = new DatabaseService(databasePool)

describe('film.service.reviewFilm', () => {

  afterEach(sinon.reset)

  it('film already exists in db', async () => {
    const user = 4
    const rating = 1

    sinon.stub(databaseService, 'getFilm').resolves({
      id: 5,
      imdbId: LE_MANS,
    })
    sinon.stub(databaseService, 'saveReview').resolves({
      film: LE_MANS,
      rating,
      reviewer: user,
    })

    const filmService = new FilmService(databaseService, omdbService)

    expect(await filmService.reviewFilm(LE_MANS, rating, user)).to.deep.equal({
      film: LE_MANS,
      rating,
      reviewer: user,
    })
  })
  it('invalid imdb id')
  it('film does not exist in db')
  it('invalid rating')
  it('rating already exists')
})
