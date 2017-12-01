const winston = require('winston')

winston.loggers.add('data-point-cache', {
  console: {
    level: 'silly',
    colorize: true,
    label: 'data-point-cache'
  }
})

const logger = winston.loggers.get('data-point-cache')
logger.cli()

module.exports = logger
