const url = require('url')
const Express = require('express')
const Middleware = require('./middleware')
const InspectorUi = require('./inspector-ui')

/**
 * @param {Object} dataPoint
 * @param {Expres.request} req
 * @param {Expres.respose} res
 * @param {function} next
 */
function dataPointInspectRoute (dataPoint, req, res, next) {
  const { entityId, params = {}, query = {}, value } = req.body

  const pathname = url.parse(req.url).pathname // eslint-disable-line node/no-deprecated-api

  const augmentedReq = Object.assign({}, req, {
    query,
    params
  })

  const transformOptions = Middleware.buildTransformOptions(augmentedReq, {
    routeRequestType: 'api',
    pathname
  })

  Middleware.resolveReducer(dataPoint, entityId, transformOptions, res, value)
}

function create (dataPoint) {
  const router = Express.Router()
  const bodyParser = require('body-parser')
  router.use(bodyParser.json())
  router.get('/', (req, res) => {
    InspectorUi.getInspector().then(html => {
      res.send(html)
    })
  })

  router.post('/', (req, res, next) => {
    dataPointInspectRoute(dataPoint, req, res, next)
  })

  router.get('/entities', (req, res) => {
    const entityKeys = Array.from(dataPoint.entities.getStore().keys())
    res.json(entityKeys)
  })

  console.warn('Inspector is running, make sure it is disabled in production.')

  return router
}

module.exports = {
  dataPointInspectRoute,
  create
}
