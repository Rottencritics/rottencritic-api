import express from 'express'

import { reviewFilm } from './film.service'

const router = express.Router()

/**
 * @swagger
 *  /films/{id}/reviews:
 *    post:
 *      description: Create a new review of a film.
 *      produces:
 *        - application/json
 *      parameters:
 *        - in: body
 *          name: review
 *          description: The reviewer's review of the film.
 *          schema:
 *            type: object
 *            required:
 *              - rating
 *            properties:
 *              rating:
 *                type: int
 *      responses:
 *        200:
 *          description: Successfully reviewed the film.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *        400:
 *          description: Error occurred while trying to review the film.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              errorMessage:
 *                type: string
 */
router.post('/:id/reviews', (req, res) => {

  if (req.body.review == null || req.body.review.rating == null) {
    res.json({
      errorMessage: 'Rating is missing in the request.',
      status: 400,
    })
    return
  }

  reviewFilm(req.params.id, req.body.review.rating, 1) // id 1 => reviewer blixn
    .then((_) => res.json({
      status: 200,
    }))
    .catch((reason) => res.json({
      errorMessage: reason,
      status: 400,
    }))
})

export default router
