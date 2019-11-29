import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import jsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

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
import { DatabasePool, DatabaseService } from './database-service'
import { FilmRouter, FilmService } from './film-service'
import { OMDbService } from './omdb-service'

const databasePool = new DatabasePool()
const databaseService = new DatabaseService(databasePool)
const omdbService = new OMDbService()
const authenticationService = new AuthenticationService(databaseService)
const filmService = new FilmService(databaseService, omdbService)

databasePool.connect()

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

/**
 * Swagger specficiation.
 *
 * Contains top level details about definition as well as paths to routes with
 * further swagger documentation in the form of jsdocs.
 */
const swaggerSpec = jsdoc({
  apis: ['src/**/*.ts'],
  basePath: '/api',
  definition: {
    info: {
      title: 'rottencritic API',
      version: '0.1.0',
    },
    openapi: '3.0.0',
  },
})

/**
 * Serve API documentation generated from our swagger spec under `/api`.
 */
app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Route did not match anything, send 404.
app.use((_, res) => {
  res.json({
    errorMessage: 'Requested resource does not exist.',
    status: 404,
  })
})

// Launch server.
app.listen(port, () => {
  console.log(`Server started at: http://localhost:${port}`)
})
