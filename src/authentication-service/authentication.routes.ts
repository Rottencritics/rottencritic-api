import express from 'express'
import basicAuth from 'express-basic-auth'
import { logger } from '../logger'
import { AuthenticationService } from './authentication.service'

export class AuthenticationRouter {

  public router = express.Router()

  constructor(private authenticationService: AuthenticationService) {
    this.createHandlers()
  }

  private createHandlers = () => {
    /**
     * @swagger
     *  /auth/token:
     *    post:
     *      tags: [authentication]
     *      summary: Retrieve an authentication token.
     *      description:
     *        The authentication token can be used to authenticate against
     *         resources requiring *Bearer Authentication*.
     *      security:
     *        - basic: []
     *      produces:
     *        - application/json
     *      responses:
     *        200:
     *          description: Successfully created a token.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  token:
     *                    type: string
     *                    example: 'long.and.secret'
     *        401:
     *          description: The given credentials are not valid.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  message:
     *                    type: string
     *                    example: Could not authenticate user.
     */
    this.router.post('/token', basicAuth({
      authorizeAsync: true,
      authorizer: this.authenticationService.validateCredentials,
      unauthorizedResponse: {
        message: 'Could not authenticate user.',
      },
    }), async (req: express.Request, res: express.Response) => {
      logger.debug('POST /auth/token')

      this.authenticationService.generateToken(req.headers.authorization)
        .then((token) => res.status(200).json({
          token
        }))
        .catch((err) => {
          logger.error(err)
          res.status(500).json({
            message: 'Failed to generate token for user.'
          })
        })
    })

    /**
     * @swagger
     *  /auth/user:
     *    post:
     *      tags: [user]
     *      summary: Create a new user.
     *      description:
     *        User used to interact with this API where authentication is
     *        required.
     *      security:
     *        - basic: []
     *      produces:
     *        - application/json
     *      requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              required:
     *                - username
     *                - password
     *              properties:
     *                username:
     *                  type: string
     *                  example: 'arthurdent'
     *                password:
     *                  type: string
     *                  example: 'dontpanic'
     *      responses:
     *        201:
     *          description: Successfully created user.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  username:
     *                    type: string
     *                    example: 'arthurdent'
     *                  id:
     *                    type: number
     *                    example: 17
     *        400:
     *          description: Failed to create user.
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  message:
     *                    type: string
     *                    example:
     *                      'A user with the name arthurdent already exists.'
     *
     */
    this.router.post('/user', (req, res) => {
      logger.debug('POST /auth/user')

      if (req.body.username == null) {
        res.status(400).json({
          message: 'Request must include username.'
        })
        return
      }

      if (req.body.password == null) {
        res.status(400).json({
          message: 'Request must include password.'
        })
        return
      }

      this.authenticationService.createUser(
        req.body.username,
        req.body.password)
        .then((user) => res.status(201)
          .header('Location', `/api/auth/user/${user.id}`)
          .json({
            name: user.username,
            id: user.id,
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
