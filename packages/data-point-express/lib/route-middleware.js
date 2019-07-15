const url = require('url')

const Middleware = require('./middleware')

function dataPointEntityRoute (dataPoint, entityId, req, res, next) {
  const pathname = url.parse(req.url).pathname // eslint-disable-line node/no-deprecated-api
  const transformOptions = Middleware.buildTransformOptions(req, {
    routeRequestType: 'api',
    pathname
  })
  Middleware.resolveReducer(dataPoint, entityId, transformOptions, res)
}

function create (dataPoint, entityId) {
  return function datapoint (req, res, next) {
    return dataPointEntityRoute(dataPoint, entityId, req, res, next)
  }
}

module.exports = {
  dataPointEntityRoute,
  create
}
