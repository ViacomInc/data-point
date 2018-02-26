const _ = require('lodash')

/**
 * @param {Object} manager
 * @return {Object}
 */
function clear (manager) {
  manager.store.clear()
  return manager
}

module.exports.clear = clear

/**
 * @param {Object} manager
 * @param {String} name
 * @param {Function} callback
 * @return {Object}
 */
function use (manager, name, callback) {
  const stack = manager.store.get(name) || []
  stack.push(callback)
  manager.store.set(name, stack)
  return manager
}

module.exports.use = use

/**
 * @param {Object} spec
 * @return {Object}
 */
function create (spec) {
  const manager = {
    store: new Map()
  }

  manager.use = _.partial(use, manager)
  manager.clear = _.partial(clear, manager)

  return manager
}

module.exports.create = create
