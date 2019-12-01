import { Router } from 'express'
import jsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

export const router = Router()

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
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
