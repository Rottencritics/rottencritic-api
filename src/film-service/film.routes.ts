import express from 'express'
import { logger } from '../logger'
import { FilmService } from './film.service'

export class FilmRouter {

  public router = express.Router()

  constructor(private filmService: FilmService) {
    this.createHandlers()
  }

  private createHandlers = () => {
    /**
     * @swagger
     *  /films/{imdbId}/reviews:
     *    post:
     *      tags: [reviews]
     *      summary: Create a new review
     *      security:
     *        - bearer: []
     *      produces:
     *        - application/json
     *      parameters:
     *        - in: path
     *          name: imdbId
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
    this.router.post('/:id/reviews', (req, res) => {
      logger.debug('FilmRoutes.postReviewsHandler()')

      if (req.body.review == null || req.body.review.rating == null) {
        res.status(400).json({
          message: 'Rating is missing in the request.',
        })
        return
      }

      // id 1 => reviewer blixn
      this.filmService.reviewFilm(req.params.id, req.body.review.rating, 1)
        .then((_) => res.status(200).json())
        .catch((reason) => res.status(400).json({
          message: reason,
        }))
    })

    /**
     * @swagger
     *  /films/{imdbId}/reviews:
     *    get:
     *      tags: [reviews]
     *      summary: Get a list of all reviews of a film
     *      parameters:
     *        - in: path
     *          name: imdbId
     *          description: The IMDb ID of the film to get reviews for.
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
     *                          example: 17
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
    this.router.get('/:id/reviews', (req, res) => {
      logger.debug('FilmRoutes.getReviewsHandler()')

      this.filmService.getReviews(req.params.id)
        .then((reviews) => res.status(200).json({
          reviews,
        }))
        .catch((reason) => res.status(400).json({
          message: reason,
        }))
    })
  }
}
