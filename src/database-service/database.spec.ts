import { assert, expect } from 'chai'
import sinon from 'sinon'
import { DatabaseService } from './database.service'

const LE_MANS = 'tt1950186'

afterEach(sinon.reset)

describe('database.service.saveReview', () => {
  it('updating existing review', async () => {
    const databaseService = new DatabaseService()
    const stub = sinon.stub().resolves({
      rows: [{
        film: LE_MANS, rating: -1, reviewer: 1,
      }]
    })
    sinon.stub(databaseService.pool, 'connect').resolves({
      query: stub, release: (_?: Error): void => null
    })

    expect(await databaseService.saveReview(1, 1, -1)).to.deep.equal({
      film: LE_MANS,
      rating: -1,
      reviewer: 1,
    })
  })
  it('creating new review', async () => {
    const databaseService = new DatabaseService()
    const stub = sinon.stub().resolves({
      rows: [{
        film: LE_MANS, rating: 1, reviewer: 1,
      }]
    })
    sinon.stub(databaseService.pool, 'connect').resolves({
      query: stub, release: (_?: Error): void => null
    })
    expect(await databaseService.saveReview(1, 1, 1)).to.deep.equal({
      film: LE_MANS,
      rating: 1,
      reviewer: 1,
    })
  })
})

describe('database.service.getFilm', () => {
  it('film does not exist', () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: []
    })
    databaseService.getFilm(LE_MANS)
      .then(() => assert.fail('Should have thrown an error.'))
      .catch((err) => expect(err).to.equal(
        `No film in database with imdbId=${LE_MANS}`))
  })
  it('film exists', () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: [{
        id: 5,
      }]
    })
    databaseService.getFilm(LE_MANS)
      .then((film) => expect(film).to.deep.equal({
        id: 5,
        imdbId: LE_MANS,
      }))
      .catch((err) => assert.fail(err))
  })
})

describe('database.service.createFilm', () => {
  it('film already exists', async () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').rejects('Some error')

    databaseService.createFilm(LE_MANS)
      .then(() => assert.fail('Should have thrown an error.'))
      .catch((err) => expect(err.name).to.equal('Some error'))
  })
  it('film created ok', async () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: [{
        id: 7,
      }]
    })

    expect(await databaseService.createFilm(LE_MANS)).to.deep.equal({
      id: 7, imdbId: LE_MANS,
    })
  })
})

describe('database.service.getReviewersByName', () => {
  it('found reviewer', async () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: [{
        id: 17,
        name: 'Shelby',
        password: 'secret',
      }]
    })
    expect(await databaseService.getReviewersByName('Shelby')).to.deep.equal({
      id: 17,
      password: 'secret',
      username: 'Shelby',
    })
  })
  it('no reviewer found', () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: []
    })
    databaseService.getReviewersByName('Shelby')
      .then(() => assert.fail('Should have failed.'))
      .catch((err) => expect(err).to.equal(
        'No reviewer found by the name \'Shelby\'.'))
  })
})

describe('database.service.loadReviews', () => {
  it('no reviews exist', async () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: []
    })
    expect(await databaseService.loadReviews(LE_MANS)).to.deep.equal([])
  })
  it('mulitple reviews exist', async () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: [
        {
          film: 17,
          rating: 1,
          reviewer: 1,
        },
        {
          film: 17,
          rating: 1,
          reviewer: 2,
        },
        {
          film: 17,
          rating: -1,
          reviewer: 3,
        },
      ],
    })
    expect(await databaseService.loadReviews(LE_MANS)).to.deep.equal([
      {
        film: LE_MANS,
        rating: 1,
        reviewer: 1,
      },
      {
        film: LE_MANS,
        rating: 1,
        reviewer: 2,
      },
      {
        film: LE_MANS,
        rating: -1,
        reviewer: 3,
      },
    ])
  })
  it('one review exist', async () => {
    const databaseService = new DatabaseService()
    sinon.stub(databaseService.pool, 'query').resolves({
      rows: [{
        film: 13,
        rating: -1,
        reviewer: 17,
      }],
    })
    expect(await databaseService.loadReviews(LE_MANS)).to.deep.equal([{
      film: LE_MANS,
      rating: -1,
      reviewer: 17,
    }]
    )
  })
})
