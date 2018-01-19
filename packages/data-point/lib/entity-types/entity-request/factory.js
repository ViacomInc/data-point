const _ = require('lodash')
const createBaseEntity = require('../base-entity').create
const createReducer = require('../../reducer-types').create

/**
 * @class
 * @property {string} url
 * @property {reducer} options
 * @property {reducer} beforeRequest
 */
function EntityRequest () {
  this.url = undefined
  this.options = undefined
}

module.exports.EntityRequest = EntityRequest

/**
 * @return {Object}
 */
function defaultOptions () {
  return {}
}

module.exports.defaultOptions = defaultOptions

/**
 * creates new Request based on spec
 * @param {Object} spec - request spec
 * @param {string} id - Entity id
 * @return {EntityRequest} Entity Object
 */
function create (spec, id) {
  const entity = createBaseEntity(EntityRequest, spec, id)
  entity.url = _.defaultTo(spec.url, '')
  if (spec.beforeRequest) {
    entity.beforeRequest = createReducer(spec.beforeRequest)
  }

  entity.options = createReducer(spec.options || defaultOptions)

  return Object.freeze(entity)
}

module.exports.create = create
