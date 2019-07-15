const CacheMiddleware = require('./cache-middleware')

function setupMiddleware (service) {
  return Promise.resolve(true).then(() => {
    const settings = service.settings
    const dataPoint = service.dataPoint

    const middlewareBefore = settings.before
      ? settings.before
      : CacheMiddleware.before.bind(null, service)
    const middlewareAfter = settings.after
      ? settings.after
      : CacheMiddleware.after.bind(null, service)

    dataPoint.middleware.use('before', middlewareBefore)
    dataPoint.middleware.use('after', middlewareAfter)

    return service
  })
}

module.exports.setupMiddleware = setupMiddleware
