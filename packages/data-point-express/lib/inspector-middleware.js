const url = require("url");
const Express = require("express");
const bodyParser = require("body-parser");

const Middleware = require("./middleware");
const InspectorUi = require("./inspector-ui");

/**
 * @param {Object} dataPoint
 * @param {Expres.request} req
 * @param {Expres.respose} res
 * @param {function} next
 */
function dataPointInspectRoute(dataPoint, req, res) {
  const { entityId, params = {}, query = {}, value } = req.body;

  const pathname = url.parse(req.url).pathname;

  const augmentedReq = Object.assign({}, req, {
    query,
    params
  });

  const transformOptions = Middleware.buildTransformOptions(augmentedReq, {
    routeRequestType: "api",
    pathname
  });

  Middleware.resolveReducer(dataPoint, entityId, transformOptions, res, value);
}

function create(dataPoint) {
  const router = Express.Router();

  router.use(bodyParser.json());
  router.get("/", async (req, res) => {
    const html = await InspectorUi.getInspector();
    res.send(html);
  });

  router.post("/", (req, res, next) => {
    dataPointInspectRoute(dataPoint, req, res, next);
  });

  router.get("/entities", (req, res) => {
    const entityKeys = Array.from(dataPoint.entities.getStore().keys());
    res.json(entityKeys);
  });

  // eslint-disable-next-line no-console
  console.warn("Inspector is running, make sure it is disabled in production.");

  return router;
}

module.exports = {
  dataPointInspectRoute,
  create
};
