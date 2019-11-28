import dotenv from 'dotenv'
import express from 'express'
import jsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Read config from environment variables.
dotenv.config()

const app = express()
const port = 8080

import filmsRouter from './film-service'

/**
 * Mount routers from services.
 */
app.use('/api/films', filmsRouter)

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
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Launch server.
app.listen(port, () => {
  console.log(`Server started at: http://localhost:${port}`)
})
