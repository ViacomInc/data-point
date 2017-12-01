const _ = require('lodash')

/**
 * @param {Express.Request} req
 * @param {Object} routeParams
 */
function buildTransformOptions (req, options = {}) {
  const query = _.defaultTo(req.query, {})
  const params = req.params
  return {
    locals: {
      routeRequestType: options.routeRequestType,
      query,
      params,
      req,
      url: req.url,
      pathname: options.pathname,
      resetCache: req.query.resetCache === 'true',
      queryParams: _.defaults({}, query, params),
      paramsQuery: _.defaults({}, params, query)
    },
    trace: false
  }
}

function getErrorOwnKeys (err) {
  const cleanObject = _.omit(err, ['name', 'message'])
  return _.mapValues(cleanObject, (value, key) => {
    const err = _.attempt(JSON.stringify, value)
    if (err instanceof Error) {
      return err.toString()
    }
    return value
  })
}

function createErrorMessage (err) {
  return {
    type: err.name,
    message: err.message,
    info: getErrorOwnKeys(err)
  }
}

function resolveTransform (
  dataPoint,
  transform,
  options,
  res,
  initialValue = {}
) {
  dataPoint
    .transform(transform, initialValue, options)
    .then(acc => {
      if (typeof acc.value === 'string') {
        res.send(acc.value)
        return
      }
      res.json(acc.value)
    })
    .catch(err => {
      res.status(400).send(createErrorMessage(err))
    })
    .done()
}

module.exports = {
  getErrorOwnKeys,
  resolveTransform,
  createErrorMessage,
  buildTransformOptions
}
