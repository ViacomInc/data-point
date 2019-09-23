const express = require("express");
const _ = require("lodash");

const RouteMap = require("./route-map");
const RouteMiddleware = require("./route-middleware");

/**
 * create API Middleware route
 * @param {DataPoint} dataPoint - DataPoint instance
 * @param {string} entityId
 * @return {function}
 */
function createApiRoute(dataPoint) {
  return function createDataPointRoute(entityId) {
    return RouteMiddleware.create(dataPoint, entityId);
  };
}

function createRoutes(app, rootPath, routes, dataPoint) {
  return RouteMap.createRoutes(
    app,
    rootPath,
    routes,
    createApiRoute(dataPoint)
  );
}

function setupRouter(router, routes, dataPoint) {
  if (_.isEmpty(routes)) {
    throw new Error("Routes option must be provided");
  }

  return createRoutes(router, "/", routes, dataPoint);
}

function create(dataPoint, routes) {
  const router = express.Router();
  return setupRouter(router, routes, dataPoint);
}

module.exports = {
  createApiRoute,
  createRoutes,
  setupRouter,
  create
};
