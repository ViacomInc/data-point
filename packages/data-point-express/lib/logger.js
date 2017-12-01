const winston = require('winston')

winston.loggers.add('data-point-express', {
  console: {
    level: 'silly',
    colorize: true,
    label: 'data-point-express'
  }
})

const logger = winston.loggers.get('data-point-express')
logger.cli()

module.exports = logger
