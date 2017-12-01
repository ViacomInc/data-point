const winston = require('winston')

winston.loggers.add('data-point-service', {
  console: {
    level: 'silly',
    colorize: true,
    label: 'data-point-service'
  }
})

const logger = winston.loggers.get('data-point-service')
logger.cli()

module.exports = logger
