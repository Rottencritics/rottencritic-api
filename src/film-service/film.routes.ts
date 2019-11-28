import express from 'express'

import { likeFilm } from './film.service'

const router = express.Router()

/**
 * @swagger
 *  /films/{id}/like:
 *    post:
 *      description: Like film.
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Successfully liked film.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *        400:
 *          description: Error occurred while trying to like film.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *              errorMessage:
 *                type: string
 */
router.post('/:id/like', (req, res) => {

  likeFilm(req.params.id, 1) // id 1 => reviewer blixn
    .then((_) => res.json({
      status: 200,
    }))
    .catch((reason) => res.json({
      errorMessage: reason,
      status: 400,
    }))
})

export default router
