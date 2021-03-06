import { Pool } from 'pg'
import { logger } from '../logger'
import { Film, Review, User } from '../types'
import { CONFIG } from './database.config'

export class DatabaseService {

  public pool: Pool
  constructor() {
    this.pool = new Pool(CONFIG)
  }

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
  public saveReview = async (
    filmId: number,
    userId: number,
    rating: number,
  ): Promise<Review> => {
    logger.debug('DatabaseService.saveReview()')

    const client = await this.pool.connect()

    logger.verbose(`Saving Review to DB:
      filmdId=${filmId},userId=${userId},rating=${rating}`)
    await client.query(
      `INSERT INTO reviews (reviewer,film,rating) VALUES ($1,$2,$3)
         ON CONFLICT (reviewer,film) DO UPDATE
           SET rating = EXCLUDED.rating;`,
      [userId, filmId, rating]
    )

    const { rows } = await client.query(
      `SELECT reviewer,film,rating FROM reviews WHERE
         reviewer=$1 AND film=$2;`,
      [userId, filmId]
    )

    client.release()

    return {
      film: rows[0].film,
      rating: rows[0].rating,
      reviewer: rows[0].reviewer,
    }
  }

  /**
   * Get film based on IMDB ID.
   * @param imdbId ID of film to retrieve from database.
   */
  public getFilm = async (imdbId: string): Promise<Film> => {
    logger.debug('DatabaseService.getFilm()')

    const res = await this.pool.query(
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
  public createFilm = async (
    imdbId: string
  ): Promise<Film> => {
    logger.debug('DatabaseService.createFilm()')

    const res = await this.pool.query(
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
  public getReviewerByName = async (name: string): Promise<User> => {
    logger.debug('DatabaseService.getReviewerByName()')

    const res = await this.pool.query(
      'SELECT * FROM reviewers WHERE name=$1::text;',
      [name],
    )

    if (res.rows.length === 0) {
      return Promise.reject(`No reviewer found by the name '${name}'.`)
    }

    return {
      id: res.rows[0].id,
      password: res.rows[0].password,
      username: name,
    }
  }

  public getReviewerById = async (id: number): Promise<User> => {
    logger.debug('DatabaseService.getReviewerById()')

    const { rows } = await this.pool.query(
      'SELECT * FROM reviewers WHERE id=$1',
      [id]
    )

    if (rows.length === 0) {
      return Promise.reject(`No reviewer found with the id: '${id}'.`)
    }

    return {
      id,
      password: rows[0].password,
      username: rows[0].name,
    }
  }

  public reviewerExists = async (name: string): Promise<boolean> => {
    const { rows } = await this.pool.query(
      'SELECT id FROM reviewers WHERE name=$1::text',
      [name],
    )

    return rows.length !== 0
  }

  /**
   * Get all, full, reviews of a given film.
   * @param imdbId film to get reviews for.
   */
  public loadReviewsByIMDbID = async (imdbId: string): Promise<Review[]> => {
    logger.debug('DatabaseService.loadReviews()')

    return this.pool.query(
      `SELECT u.name,f.imdbid,r.reviewer,r.rating FROM reviews r
        INNER JOIN films f
          ON r.film=f.id
        INNER JOIN reviewers u
          ON r.reviewer=u.id
        WHERE f.imdbid=$1::text`,
      [imdbId]
    ).then((res) => {
      return res.rows.map(
        (review): Review => {
          return {
            film: imdbId,
            rating: review.rating,
            reviewer: review.name,
          }
        })
    })
  }

  public loadReviewsByReviewer = async (
    reviewer: number
  ): Promise<Review[]> => {
    logger.debug('DatabaseService.loadReviewsByReviewer()')

    const { rows } = await this.pool.query(
      `SELECT u.name,f.imdbid,r.reviewer,r.rating FROM reviews r
        INNER JOIN films f
          ON r.film=f.id
        INNER JOIN reviewers u
          ON r.reviewer=u.id
        WHERE r.reviewer=$1`,
      [reviewer]
    )

    return rows.map(
      (review): Review => {
        return {
          film: review.imdbid,
          rating: review.rating,
          reviewer: review.name,
        }
      }
    )
  }

  public loadReview = async (
    imdbId: string,
    reviewer: number
  ): Promise<Review[]> => {
    logger.debug('DatabaseService.loadReview()')

    const { rows } = await this.pool.query(
      `SELECT u.name,r.reviewer,r.rating FROM reviews r
        INNER JOIN films f
          ON r.film=f.id
        INNER JOIN reviewers u
          ON r.reviewer=u.id
        WHERE f.imdbId=$1::text AND r.reviewer=$2`,
      [imdbId, reviewer]
    )

    logger.debug(rows)

    if (rows.length === 0) {
      return []
    }

    return [{
      film: imdbId,
      rating: rows[0].rating,
      reviewer: rows[0].name,
    }]
  }

  public saveReviewer = async (
    username: string,
    password: string
  ): Promise<number> => {
    const { rows } = await this.pool.query(
      `INSERT INTO reviewers (name,password)
       VALUES ($1::text,$2::text)
       RETURNING id`,
      [username, password])

    return rows[0].id
  }
}
