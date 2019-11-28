import express from 'express'
import basicAuth from 'express-basic-auth'
import {
  extractUsernameFromAuthorizationHeader,
  generateToken,
  validateCredentials,
} from './authentication.service'

const router = express.Router()

/**
 * @swagger
 *  /auth/token:
 *    post:
 *      description: Retrieve a new token.
 *      produces:
 *        - application/json
 *      200:
 *        description: Successfully created a token.
 *        schema:
 *          type: object
 *          properties:
 *            status:
 *              type: integer
 *      401:
 *        description: The given credentials are not valid.
 *        schema:
 *          type: object
 *          properties:
 *            status:
 *              type: integer
 *            message:
 *              type: string
 */
router.post('/token', basicAuth({
  authorizeAsync: true,
  authorizer: validateCredentials,
  unauthorizedResponse: {
    message: 'Could not authenticate user.',
    status: 401,
  },
}), (req, res) => {
  res.json({
    status: 200,
    token: generateToken(extractUsernameFromAuthorizationHeader(req)),
  })
})

export default router
