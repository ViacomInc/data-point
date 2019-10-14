const _ = require("lodash");
const path = require("path");

function toCollection(hash) {
  const keys = Object.keys(hash);
  const list = keys.reduce((acc, key) => {
    const spec = hash[key];
    spec.id = key;
    acc.push(spec);
    return acc;
  }, []);
  return list;
}

function sortByPriority(list) {
  return _.orderBy(list, ["priority"], ["asc"]);
}

function filterEnabled(list) {
  return _.filter(list, route => {
    return route.enabled !== false;
  });
}

function normalizeRoutesMiddleware(routes) {
  return routes.map(route => {
    return Object.assign({}, route, {
      middleware: _.castArray(route.middleware)
    });
  });
}

function verifyMiddlewareFormat(route) {
  const middleware = _.castArray(route.middleware);
  if (middleware.length === 0) {
    throw new Error(
      `Route ${route.id} - middleware property must not be empty`
    );
  }

  const entityIds = middleware.filter(item => typeof item === "string");
  if (entityIds.length > 1) {
    throw new Error(
      `Route ${
        route.id
      } - middleware should only map to 1 entityId, found: ${entityIds.join(
        ","
      )}`
    );
  }

  if (entityIds.length > 0) {
    const entityIdIndex = middleware.indexOf(entityIds[0]);
    if (entityIdIndex !== middleware.length - 1) {
      throw new Error(
        `Route ${route.id} - entityId middleware may only be at the end of the chain`
      );
    }
  }

  return true;
}

function normalize(routes = []) {
  return _.flow([
    toCollection,
    filterEnabled,
    sortByPriority,
    normalizeRoutesMiddleware
  ])(routes);
}

function normalizeMiddleware(middlewareList, dataPointMiddleware) {
  return middlewareList.map(middleware => {
    if (_.isString(middleware)) {
      return dataPointMiddleware(middleware);
    }

    return middleware;
  });
}

function sendResponseFromValue(req, res) {
  if (typeof req.value === "string") {
    res.send(req.value);
    return;
  }

  res.json(req.value);
}

// each method should map to an express method
const validMethods = ["get", "put", "delete", "post"];

/**
 * @param {string} httpMethod
 */
function getRouteMethod(httpMethod = "get") {
  const method = httpMethod.toLowerCase();
  if (validMethods.includes(method)) {
    return method;
  }

  return false;
}

/**
 * @param {Express} app
 * @param {string} rootPath - route's root path
 * @param {string} route
 * @param {function} dataPointMiddleware - function to create a dataPoint middleware function
 */
function addRoute(app, rootPath, route, dataPointMiddleware) {
  const method = getRouteMethod(route.method);

  if (method === false) {
    throw new Error(
      `Route ${route.id} has an invalid method (${route.method}), try using GET, POST, DELETE or PUT instead.`
    );
  }

  // we are here accessing the express methods:
  // get, put, delete, post
  const appRouteMethod = app[method];

  verifyMiddlewareFormat(route);

  const middleware = normalizeMiddleware(route.middleware, dataPointMiddleware);

  const routePath = path.join("/", rootPath, route.path);
  // create arguments to get passed to Express route method
  const args = [].concat(routePath, middleware);
  // adds the route to express
  appRouteMethod.apply(app, args);
}

/**
 * @param {Express} app
 * @param {string} rootPath - route's root path
 * @param {Array<string>} routes - list of routes
 * @param {function} dataPointMiddleware - function to create a dataPoint middleware function
 */
function createRoutes(app, rootPath, routes, dataPointMiddleware) {
  const normalizedRoutes = normalize(routes);
  normalizedRoutes.forEach(route =>
    addRoute(app, rootPath, route, dataPointMiddleware)
  );

  return app;
}

module.exports = {
  filterEnabled,
  sortByPriority,
  toCollection,
  verifyMiddlewareFormat,
  normalize,
  normalizeRoutesMiddleware,
  normalizeMiddleware,
  sendResponseFromValue,
  getRouteMethod,
  addRoute,
  createRoutes
};
