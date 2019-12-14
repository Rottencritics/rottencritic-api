import { DatabaseService } from '../database-service'
import { logger } from '../logger'
import { OMDbService } from '../omdb-service'
import { Film, InternalError, Review, User } from '../types'

const POSITIVE_RATING = 1
const NEUTRAL_RATING = 0
const NEGATIVE_RATING = -1

const RATINGS = [POSITIVE_RATING, NEUTRAL_RATING, NEGATIVE_RATING]
export class ReviewService {

  constructor(
    private databaseService: DatabaseService,
    private omdbService: OMDbService) { }

  public reviewFilm = async (
    imdbId: string,
    rating: number, // TODO: replace rating param with complete review
    userId: number
  ): Promise<Review> => {
    logger.debug('FilmService.reviewFilm()')

    let film: Film
    try {
      film = await this.databaseService.getFilm(imdbId)
    } catch (_) {
      /**
       * The film does not already exist in our database, so we have to make
       * sure that the IMDb ID is valid by querying OMDb for it. If it exists,
       * and the rating is not neutral we create a new database entry for the
       * film.
       */
      await this.omdbService.fetchFilm(imdbId) // Will throw error if invalid.

      if (rating === NEUTRAL_RATING) {
        return this.createNonSavedReview(userId, imdbId, rating)
      } else {
        film = await this.databaseService.createFilm(imdbId)
      }
    }

    return this.rateFilm(film, rating, userId)
  }

  public getReviews = async (
    imdbId?: string,
    reviewer?: string
  ): Promise<Review[]> => {
    logger.debug('FilmService.getReviews()')

    let user: User
    if (imdbId) {
      // Make sure the film actually exists
      await this.omdbService.fetchFilm(imdbId)

      if (reviewer) {
        user = await this.databaseService.getReviewerByName(reviewer)
      } else {
        logger.verbose('Getting review based on imdbID.')
        return this.databaseService.loadReviewsByIMDbID(imdbId)
      }

      logger.verbose('Getting review based on reviewer/imdbID.')
      return this.databaseService.loadReview(imdbId, user.id)

    } else if (reviewer) {
      user = await this.databaseService.getReviewerByName(reviewer)

      logger.verbose('Getting review based on reviewer.')
      return this.databaseService.loadReviewsByReviewer(user.id)
    }

    return Promise.reject('IMDb ID or reviewer must be given.')
  }

  private rateFilm = (
    film: Film,
    rating: number,
    userId: number
  ): Promise<Review> => {
    logger.debug('FilmService.rateFilm()')

    if (!RATINGS.includes(rating)) {
      return Promise.reject(`Invalid rating value: ${rating}`)
    }

    return this.databaseService.saveReview(film.id, userId, rating)
  }

  /**
   * Create a Review -object without saving it to database.
   * @param reviewerId The user ID of the reviewer.
   * @param film The IMDb ID of the film to review.
   * @param rating The rating to give the movie.
   * @throws InternalError If the user cannot be found in the database. This
   *                       most likely means something went wrong with the
   *                       user's authentication.
   */
  private createNonSavedReview = async (
    reviewerId: number,
    film: string,
    rating: number
  ): Promise<Review> => {
    let username: string
    try {
      username =
        (await this.databaseService.getReviewerById(reviewerId)).username
    } catch (err) { // This should not happen
      logger.error(err)
      throw new InternalError(
        'Could not retrieve user by ID. Is the user authenticated?')
    }
    return {
      film,
      rating,
      reviewer: username,
    }
  }

}
