const _ = require('lodash')
const { resolve } = require('./resolve')
const createBaseEntity = require('../base-entity').create
const createReducer = require('../../reducer-types').create
const { validateModifiers } = require('../validate-modifiers')

/**
 * @class
 * @property {string} url
 * @property {reducer} options
 */
function EntityRequest () {
  this.entityType = 'request'
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
function create (id, spec) {
  validateModifiers(id, spec, ['options', 'url'])
  const entity = createBaseEntity(id, spec, resolve, EntityRequest)
  entity.url = _.defaultTo(spec.url, '')
  entity.options = createReducer(spec.options || defaultOptions)

  return Object.freeze(entity)
}

module.exports.create = create
