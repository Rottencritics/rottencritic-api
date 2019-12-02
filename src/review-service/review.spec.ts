import { assert, expect } from 'chai'
import sinon, { SinonSandbox } from 'sinon'
import { DatabaseService } from '../database-service'
import { OMDbService } from '../omdb-service'
import { Review } from '../types'
import { ReviewService } from './review.service'

const LE_MANS = 'tt1950186'
const BAD_IMDB_ID = 'tt196'

const omdbService = new OMDbService()
const databaseService = new DatabaseService()

let sandbox: SinonSandbox

describe('film.service.reviewFilm', () => {

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('film already exists in db', async () => {
    const user = 'Freddie'
    const userId = 4
    const rating = 1

    sandbox.stub(databaseService, 'getFilm').resolves({
      id: 5,
      imdbId: LE_MANS,
    })
    sandbox.stub(databaseService, 'saveReview').resolves({
      film: LE_MANS,
      rating,
      reviewer: user,
    })

    const filmService = new ReviewService(databaseService, omdbService)

    expect(await filmService.reviewFilm(LE_MANS, rating, userId)).to.deep.equal({
      film: LE_MANS,
      rating,
      reviewer: user,
    })
  })

  it('invalid imdb id', () => {
    const user = 4
    const rating = 1
    const filmService = new ReviewService(databaseService, omdbService)

    sandbox.stub(databaseService, 'getFilm').rejects('Film does not exist')
    sandbox.stub(omdbService, 'fetchFilm').rejects('IMDb ID is not valid.')
    filmService.reviewFilm(BAD_IMDB_ID, rating, user)
      .then((_) => assert.fail('Should throw an error'))
      .catch((err) => expect(err.name).to.equal('IMDb ID is not valid.'))

  })

  it('film does not exist in db', async () => {
    const user = 'Henry'
    const userId = 4
    const rating = 1
    const filmService = new ReviewService(databaseService, omdbService)

    sandbox.stub(databaseService, 'getFilm').rejects('Film does not exist')
    sandbox.stub(databaseService, 'createFilm').resolves({ id: 17, imdbId: LE_MANS })
    sandbox.stub(databaseService, 'saveReview').resolves({
      film: LE_MANS,
      rating,
      reviewer: user,
    })
    sandbox.stub(omdbService, 'fetchFilm').resolves({ imdbId: LE_MANS })

    expect(await filmService.reviewFilm(LE_MANS, rating, userId))
      .to.deep.equal({
        film: LE_MANS,
        rating,
        reviewer: user,
      })
  })
  it('invalid rating', () => {
    const user = 4
    const rating = 13
    const filmService = new ReviewService(databaseService, omdbService)

    sandbox.stub(databaseService, 'getFilm').resolves({
      id: 5,
      imdbId: LE_MANS,
    })

    filmService.reviewFilm(LE_MANS, rating, user)
      .then((_) => assert.fail('Should throw an error.'))
      .catch((err) => expect(err).to.equal(`Invalid rating value: ${rating}`))
  })

})

describe('film.service.getReviews', () => {

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('film does not exist in imdb', () => {
    sandbox.stub(omdbService, 'fetchFilm').rejects('Does not exist in IMDB.')
    const filmService = new ReviewService(databaseService, omdbService)
    filmService.getReviews(BAD_IMDB_ID)
      .then((_) => assert.fail('Should have thrown an error.'))
      .catch((err) => expect(err.name).to.equal('Does not exist in IMDB.'))
  })

  it('multiple reviews exist', async () => {
    sandbox.stub(omdbService, 'fetchFilm').resolves({
      imdbId: LE_MANS,
    })

    const expectedResult: Review[] = [
      {
        film: LE_MANS,
        rating: 1,
        reviewer: 'Henry',
      },
      {
        film: LE_MANS,
        rating: -1,
        reviewer: 'Bergkamp',
      },
      {
        film: LE_MANS,
        rating: -1,
        reviewer: 'Pires',
      },
    ]

    sandbox.stub(databaseService, 'loadReviewsByIMDbID').resolves(expectedResult)
    const filmService = new ReviewService(databaseService, omdbService)
    expect(await filmService.getReviews(LE_MANS)).to.deep.equal(expectedResult)
  })

  it('no reviews exist', async () => {

    sandbox.stub(omdbService, 'fetchFilm').resolves({
      imdbId: LE_MANS,
    })

    sandbox.stub(databaseService, 'loadReviewsByIMDbID').resolves([])
    const filmService = new ReviewService(databaseService, omdbService)
    expect(await filmService.getReviews(LE_MANS)).to.deep.equal([])
  })

  it('single review exists', async () => {

    sandbox.stub(omdbService, 'fetchFilm').resolves({
      imdbId: LE_MANS,
    })

    const expectedResult: Review[] = [{
      film: LE_MANS,
      rating: 1,
      reviewer: 'Freddie',
    },
    ]

    sandbox.stub(databaseService, 'loadReviewsByIMDbID').resolves(expectedResult)
    const filmService = new ReviewService(databaseService, omdbService)
    expect(await filmService.getReviews(LE_MANS)).to.deep.equal(expectedResult)
  })
})
