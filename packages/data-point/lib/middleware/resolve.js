const Promise = require('bluebird')

const middlewareContextFactory = require('../middleware-context')
const middlewareControl = require('../middleware-control')

/**
 * @param {Map} store
 * @param {String} middlewareName
 * @return {Array}
 */
function getStack (store, middlewareName) {
  return store.get(middlewareName) || []
}

module.exports.getStack = getStack

/**
 * @param {Object} manager
 * @param {String} middlewareName
 * @param {Accumulator} accumulator
 * @return {Promise}
 */
function resolve (manager, middlewareName, accumulator) {
  const stack = getStack(manager.middleware.store, middlewareName)
  if (stack.length === 0) {
    return Promise.resolve(accumulator)
  }

  accumulator = middlewareContextFactory.create(accumulator)
  return middlewareControl(accumulator, stack)
}

module.exports.resolve = resolve
