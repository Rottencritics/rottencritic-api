import express from 'express'
import jstoken from 'jsonwebtoken'

import { DatabaseService } from '../database-service'
import { logger } from '../logger'

export class AuthenticationService {

  constructor(private databaseService: DatabaseService) { }

  /**
   * Generate a new token for user.
   * @param authorizationHeader The Basic Authentication Header where the
   *                            username we create a token for exists.
   */
  public generateToken = async (authorizationHeader: string): Promise<string> => {
    logger.debug('AuthenticationService.generateToken()')

    const { id } =
      await this.databaseService.getReviewerByName(
        this.extractUsernameFromAuthorizationHeader(authorizationHeader))

    return jstoken.sign(
      { user: id },
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
    logger.debug('AuthenticationService.validateCredentials()')

    return this.databaseService.getReviewerByName(username).then((user) => {
      return authorize(null, user.password === password)
    }).catch((_) => {
      return authorize(null, false)
    })
  }

  /**
   * Get a user's name from the authorization header of a basic auth request.
   * @param authorizationHeader the Basic Authentication header to get
   *                            username from.
   */
  private extractUsernameFromAuthorizationHeader = (
    authorizationHeader: string
  ) => {
    logger.debug('AuthenticationService.extractUsernameFromAuthorzationHeader()')

    return Buffer.from(authorizationHeader.split(' ').pop(), 'base64')
      .toString('ascii')
      .split(':')[0]
  }
}
