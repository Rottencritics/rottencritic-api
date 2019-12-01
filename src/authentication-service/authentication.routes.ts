import express from 'express'
import basicAuth from 'express-basic-auth'
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
    this.router.post('/token', basicAuth({
      authorizeAsync: true,
      authorizer: this.authenticationService.validateCredentials,
      unauthorizedResponse: {
        message: 'Could not authenticate user.',
        status: 401,
      },
    }), (req: express.Request, res: express.Response) => {
      console.log('inside /token')
      res.json({
        status: 200,
        token: this.authenticationService.generateToken(
          this.authenticationService.extractUsernameFromAuthorizationHeader(req)),
      })
    })
  }
}
