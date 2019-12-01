import { DatabaseService } from '../database-service'
import { logger } from '../logger'
import { OMDbService } from '../omdb-service'
import { Film, Review } from '../types'

export class FilmService {

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
       * The film does not already exist in our database, so we have to make sure
       * that the IMDb ID is valid by querying OMDb for it. If it exists, we
       * create a new database entry for the film.
       */
      await this.omdbService.fetchFilm(imdbId) // Will throw error if invalid.
      film = await this.databaseService.createFilm(imdbId)
    }

    return this.rateFilm(film, rating, userId)
  }

  public getReviews = async (imdbId: string): Promise<Review[]> => {
    logger.debug('FilmService.getReviews()')

    // first we make sure the film actually exist
    return this.omdbService.fetchFilm(imdbId)
      .then((_) => {
        return this.databaseService.loadReviews(imdbId)
      })
  }

  private rateFilm = (
    film: Film,
    rating: number,
    userId: number
  ): Promise<Review> => {
    logger.debug('FilmService.rateFilm()')

    if (![1, 0, -1].includes(rating)) {
      return Promise.reject(`Invalid rating value: ${rating}`)
    }

    return this.databaseService.saveReview(film.id, userId, rating)
  }
}
