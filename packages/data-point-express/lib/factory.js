const DataPoint = require("data-point");
const Service = require("data-point-service");

const RouteMiddleware = require("./route-middleware");
const MiddlewareRouter = require("./router-middleware");
const InspectorMiddleware = require("./inspector-middleware");

function createMiddleware(service) {
  const dataPoint = service.dataPoint;

  return Object.assign({}, service, {
    /**
     * @param {string} entityId entityId that maps to route
     */
    mapTo(entityId) {
      return RouteMiddleware.create(dataPoint, entityId);
    },
    /**
     * @param {Object} routes
     */
    router(routes) {
      return MiddlewareRouter.create(dataPoint, routes);
    },
    inspector() {
      return InspectorMiddleware.create(dataPoint);
    }
  });
}

function create(options) {
  const dpInjection = {
    DataPoint
  };
  const dpOptions = Object.assign({}, options, dpInjection);

  return Service.create(dpOptions).then(createMiddleware);
}

module.exports = {
  createMiddleware,
  create
};
