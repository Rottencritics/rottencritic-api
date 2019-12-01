import express from 'express'
import jwt from 'express-jwt'

/**
 * URIs that will not require the user to be authenticated by token.
 */
const PUBLIC_URIS = [
  { url: /^\/api\/doc\/.*/, methods: ['GET'] },
  { url: '/api/auth/token', methods: ['POST'] },
]

/**
 * Middleware that verifies that a user has a valid token.
 *
 * If the user is lacking a valid token an error with the name:
 * `UnauthorizedError` will be set.
 * If the user has a valid token set it will be availabe in the request under
 * `req.token`.
 */
export const tokenMiddleware = jwt({
  requestProperty: 'token',
  secret: process.env.TOKEN_SECRET,
}).unless({
  path: PUBLIC_URIS,
})

/**
 * Middleware to verify that the user is authenticated.
 *
 * If the user *is not* authenticated the user will be sent a 401,
 * if the user *is* authenticated the next middleware function will be called.
 */
export const authenticationMiddleware = (
  err: Error,
  _: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.debug('authenticationMiddleware()')
  console.debug(err)
  if (err.name === 'UnauthorizedError') {
    res.json({
      message: err.message + '.', // someone was sloppy with punctuation
      status: 401,
    })
    return // return so that we do not go to the next middleware
  }
  next()
}
