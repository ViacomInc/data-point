const _ = require('lodash')
const { resolve } = require('./resolve')
const BaseEntity = require('../base-entity')
const createReducer = require('../../reducer-types').create
const { validateModifiers } = require('../validate-modifiers')

/**
 * @class
 * @property {string} url
 * @property {reducer} options
 */
function EntityRequest () {}

module.exports.EntityRequest = EntityRequest

/**
 * @return {Object}
 */
function defaultOptions () {
  return {}
}

module.exports.defaultOptions = defaultOptions

/**
 * @typedef {Array|String|Function} Reducer
 */

/**
 * creates new Request based on spec
 * @param {{url:String, options:Object, before:Reducer}} spec - request spec
 * @param {string} id - Entity id
 * @return {EntityRequest} Entity Object
 */
function create (id, spec) {
  validateModifiers(id, spec, ['options', 'url'])
  const entity = new EntityRequest()
  entity.spec = spec
  entity.resolve = resolve
  entity.url = _.defaultTo(spec.url, '')
  entity.options = createReducer(spec.options || defaultOptions)
  return entity
}

module.exports.create = BaseEntity.create('request', create)
