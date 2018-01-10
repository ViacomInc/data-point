
const _ = require('lodash')

/**
 * get the store
 * @return {Object}
 */
function getStore (manager) {
  return manager.store
}

module.exports.getStore = getStore

/**
 * clears the store
 * @return {Object}
 */
function clear (manager) {
  /* eslint no-param-reassign: "off" */
  manager.store = {}
  return manager
}
module.exports.clear = clear

/**
 * get value by path
 * @throws Will throw error if id is invalid
 * @param  {string} path - dot notation to access a filter path
 * @return {*}
 */
function get (manager, errorInfoCb, path) {
  const value = _.get(manager.store, path)
  if (_.isUndefined(value)) {
    const errorInfo = errorInfoCb(path)
    const e = new Error(errorInfo.message)
    e.name = errorInfo.message.name
    throw e
  }

  return value
}

module.exports.get = get

/**
 * get filter by path
 * @throws Will throw error if id already exists and override is not true
 * @param  {string} id - filter id
 * @return {*} returns reference to entire manager.store
 */
function add (manager, errorInfoCb, id, value, override) {
  const filter = _.get(manager.store, id)
  if (!override && filter) {
    const errorInfo = errorInfoCb(id)
    const e = new Error(errorInfo.message)
    e.name = errorInfo.message.name
    throw e
  }

  _.set(manager.store, id, value)

  return manager.store
}

module.exports.add = add

/**
 * create instance
 * @return {Object}
 */
function create (spec) {
  const manager = {
    store: {}
  }

  manager.getStore = _.partial(getStore, manager)
  manager.clear = _.partial(clear, manager)
  manager.get = _.partial(get, manager, spec.errorInfoCbGet)
  manager.add = _.partial(add, manager, spec.errorInfoCbAdd)

  return manager
}

module.exports.create = create
