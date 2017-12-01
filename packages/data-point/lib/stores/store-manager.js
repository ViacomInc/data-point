'use strict'

const _ = require('lodash')
const utils = require('../utils')

/**
 * get all added models
 * @return {Map}
 */
function getStore (manager) {
  return manager.store
}

module.exports.getStore = getStore

/**
 * clear map
 * @return {Map}
 */
function clear (manager) {
  manager.store.clear()
  return manager.store
}

module.exports.clear = clear

/**
 * get value by path
 * @throws Will throw error if id is invalid
 * @param  {string} id - model id
 * @return {*}
 */
function get (manager, errorInfoCb, id) {
  const value = manager.store.get(id)
  if (_.isUndefined(value)) {
    const errorInfo = errorInfoCb(id)
    const e = new Error(errorInfo.message)
    e.name = errorInfo.name
    throw e
  }

  return value
}

module.exports.get = get

/**
 * get filter by path
 * @throws Will throw error if id already exists and override is not true
 * @param  {string} id - filter id
 * @return {*} returns reference to entire store
 */
function add (manager, errorInfoCb, factory, id, spec) {
  if (manager.store.get(id)) {
    const errorInfo = errorInfoCb(id)
    const e = new Error(errorInfo.message)
    e.name = errorInfo.name
    throw e
  }

  const objSpec = utils.set(spec, 'id', id)
  const item = factory(objSpec, id)

  manager.store.set(id, item)

  return manager.store
}

module.exports.add = add

function create (spec) {
  const manager = {
    store: new Map()
  }

  manager.getStore = _.partial(getStore, manager)
  manager.clear = _.partial(clear, manager)
  manager.get = _.partial(get, manager, spec.errorInfoCbGet)
  manager.add = _.partial(add, manager, spec.errorInfoCbAdd, spec.create)

  return manager
}

module.exports.create = create
