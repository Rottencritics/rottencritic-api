import winston from 'winston'

/**
 * Log level used as long as no other is specified in the environment variable:
 * LOG_LEVEL.
 */
const DEFAULT_LOG_LEVEL = 'info'

export const logger = winston.createLogger({
  exitOnError: false,
  format: winston.format.json(),
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4,
  },
  level: process.env.LOG_LEVEL ?
    process.env.LOG_LEVEL.toLowerCase() : DEFAULT_LOG_LEVEL,
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: 'express.log',
    })
  ]
})
