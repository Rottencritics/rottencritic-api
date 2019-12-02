import { AuthenticatedRequest } from 'authenticated-request'
import express from 'express'
import { logger } from '../logger'
import { ReviewService } from './review.service'

export class ReviewRouter {

  public router = express.Router()

  constructor(private filmService: ReviewService) {
    this.createHandlers()
  }

  private createHandlers = () => {
    /**
     * @swagger
     *  /reviews:
     *    post:
     *      tags: [reviews]
     *      summary: Create a new review
     *      security:
     *        - bearer: []
     *      produces:
     *        - application/json
     *      parameters:
     *        - in: query
     *          name: imdbId
     *          required: true
     *          description: The IMDb ID of the targeted film for the review.
     *        - in: body
     *          name: review
     *          description: The film review.
     *          schema:
     *            type: object
     *            required:
     *              - rating
     *            properties:
     *              rating:
     *                type: integer
     *                minimum: -1
     *                maximum: 1
     *      responses:
     *        201:
     *          description: Successfully reviewed the film.
     *        400:
     *          description: Error occurred while trying to review the film.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  message:
     *                    type: string
     *                    example: 'Invalid IMDb ID.'
     */
    this.router.post('/', (req: AuthenticatedRequest, res) => {
      logger.debug('FilmRoutes.postReviewsHandler()')

      if (req.body.review == null || req.body.review.rating == null) {
        res.status(400).json({
          message: 'Rating is missing in the request.',
        })
        return
      }

      this.filmService.reviewFilm(
        req.query.imdbId, req.body.review.rating, req.token.user)

        .then((_) => res.status(201).json())
        .catch((reason) => {
          logger.debug(reason)
          res.status(400).json({
            message: reason,
          })
        })
    })

    /**
     * @swagger
     *  /reviews:
     *    get:
     *      tags: [reviews]
     *      summary: Retrieve a list of reviews. Either grouped by film or by
     *               reviewer.
     *      parameters:
     *        - in: query
     *          name: imdbId
     *          type: string
     *          description: The IMDb ID of the film to get reviews for.
     *          example: tt1950186
     *        - in: query
     *          name: reviewer
     *          type: string
     *          description: Reviewer to get reviews from.
     *          example: bobby
     *      produces:
     *        - application/json
     *      responses:
     *        200:
     *          description: Successfully retrieved reviews.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  reviews:
     *                    type: array
     *                    items:
     *                      type: object
     *                      properties:
     *                        film:
     *                          type: string
     *                          example: tt1950186
     *                        reviewer:
     *                          type: integer
     *                          example: bobby
     *                        rating:
     *                          type: integer
     *                          example: 1
     *        400:
     *          description: Error occured while fetching reviews.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  message:
     *                    type: string
     *                    example: Invalid IMDb ID.
     */
    this.router.get('/', (req, res) => {
      logger.debug('FilmRoutes.getReviewsHandler()')
      logger.debug(`imdbId=${req.query.imdbId},reviewer=${req.query.reviewer}`)

      this.filmService.getReviews(req.query.imdbId, req.query.reviewer)
        .then((reviews) => res.status(200).json({
          reviews,
        }))
        .catch((reason) => {
          logger.debug(reason)
          res.status(400).json({
            message: reason,
          })
        })
    })
  }
}
