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

async function create(options) {
  const dpInjection = {
    DataPoint
  };
  const dpOptions = Object.assign({}, options, dpInjection);

  const service = await Service.create(dpOptions);
  return createMiddleware(service);
}

module.exports = {
  createMiddleware,
  create
};
