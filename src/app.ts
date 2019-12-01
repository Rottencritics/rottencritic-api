import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'

import { logger } from './logger'

// Read config from environment variables.
dotenv.config()

const app = express()
const port = 8080

import {
  authenticationMiddleware,
  AuthenticationRouter,
  AuthenticationService,
  tokenMiddleware,
} from './authentication-service'
import { DatabaseService } from './database-service'
import { FilmRouter, FilmService } from './film-service'
import { OMDbService } from './omdb-service'
import { router as swaggerRouter } from './swagger'

const databaseService = new DatabaseService()
const omdbService = new OMDbService()
const authenticationService = new AuthenticationService(databaseService)
const filmService = new FilmService(databaseService, omdbService)

/**
 * Mount pre-path middleware.
 */
app.use(tokenMiddleware)
app.use(authenticationMiddleware)
app.use(bodyParser.json())

/**
 * Mount routers from services.
 */
app.use('/api/auth', new AuthenticationRouter(authenticationService).router)
app.use('/api/films', new FilmRouter(filmService).router)
app.use('/api/doc', swaggerRouter)

// Route did not match anything, send 404.
app.use((_, res) => {
  res.json({
    errorMessage: 'Requested resource does not exist.',
    status: 404,
  })
})

// Launch server.
app.listen(port, () => {
  logger.info(`Server started at: http://localhost:${port}`)
})
