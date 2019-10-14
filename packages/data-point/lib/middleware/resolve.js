const middlewareContextFactory = require("../middleware-context");
const middlewareControl = require("../middleware-control");

/**
 * @param {Map} store
 * @param {String} middlewareName
 * @return {Array}
 */
function getStack(store, middlewareName) {
  return store.get(middlewareName);
}

module.exports.getStack = getStack;

/**
 * @param {Object} manager
 * @param {String} middlewareName
 * @param {Accumulator} accumulator
 * @return {Promise}
 */
function resolve(manager, middlewareName, accumulator) {
  const middlewareContext = middlewareContextFactory.create(accumulator);
  const stack = getStack(manager.middleware.store, middlewareName);
  return middlewareControl(middlewareContext, stack);
}

module.exports.resolve = resolve;
