import bcrypt from 'bcrypt'
import jstoken from 'jsonwebtoken'

import { DatabaseService } from '../database-service'
import { logger } from '../logger'
import { User } from '../types'

const SALT_ROUNDS = 10

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

    try {
      const user = await this.databaseService.getReviewerByName(username)
      return authorize(null, await bcrypt.compare(password, user.password))
    } catch (_) {
      return authorize(null, false)
    }
  }

  public createUser = async (
    username: string,
    password: string
  ): Promise<User> => {
    try {
      if (await this.databaseService.reviewerExists(username)) {
        return Promise.reject(
          `A user with the name ${username} already exists.`
        )
      }

      const hash = await this.saltPassword(password)
      const id = await this.databaseService.saveReviewer(username, hash)

      return {
        id,
        username,
      }
    } catch (err) {
      logger.debug('Could not create user.', err)
      return Promise.reject('User could not be created.')
    }
  }

  private saltPassword = (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS)
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
