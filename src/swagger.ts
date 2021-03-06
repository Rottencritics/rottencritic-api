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
  definition: {
    servers: [
      { url: 'http://localhost/api', description: 'Development server.' }
    ],
    components: {
      securitySchemes: {
        basic: {
          in: 'header',
          scheme: 'basic',
          type: 'http',
        },
        bearer: {
          bearerFormat: 'JWT',
          in: 'header',
          scheme: 'bearer',
          type: 'http',
        }
      }
    },
    info: {
      description:
        `This is the API specification for rottencritic's API.`,
      title: 'rottencritic API',
      version: '0.1.0',
    },
    openapi: '3.0.0',
    tags: [
      {
        description: 'Operations on film reviews.',
        name: 'reviews',
      },
      {
        description: 'Resources for authentication.',
        name: 'authentication',
      },
      {
        description: 'Operations on reviewers.',
        name: 'users'
      }
    ],
  },
})

/**
 * Serve API documentation generated from our swagger spec under `/api`.
 */
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
