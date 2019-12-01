import express from 'express'
import jstoken from 'jsonwebtoken'

import { DatabaseService } from '../database-service'

export class AuthenticationService {

  constructor(private databaseService: DatabaseService) { }

  /**
   * Generate a new token for user.
   * @param username name of user to generate token for/of.
   */
  public generateToken = (username: string): string => {
    return jstoken.sign(
      { user: username },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h', })
  }

  /**
   * Validate that the credentials match a user's name and password.
   * @param username username to check if valid.
   * @param password password to check if valid.
   * @param authorize callback function from *express-basic-auth* to call with
   *                  results.
   */
  public validateCredentials = async (
    username: string,
    password: string,
    authorize: (error: Error | null, s: boolean) => void,
  ) => {
    return this.databaseService.getReviewersByName(username).then((user) => {
      return authorize(null, user.password === password)
    }).catch((_) => {
      return authorize(null, false)
    })
  }

  /**
   * Get a user's name from the authorization header of a basic auth request.
   * @param req the request to retrieve header from.
   */
  public extractUsernameFromAuthorizationHeader = (
    req: express.Request
  ) => {
    return new Buffer(req.headers.authorization.split(' ').pop(), 'base64')
      .toString('ascii')
      .split(':')[0]
  }
}
