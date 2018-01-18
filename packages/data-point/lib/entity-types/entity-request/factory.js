const _ = require('lodash')
const fp = require('lodash/fp')
const createBaseEntity = require('../base-entity').create
const createReducer = require('../../reducer-types').create
const TransformKeys = require('./transform-keys')

/**
 * @class
 */
function EntityRequest () {
  this.url = undefined
  this.options = {}
  this.beforeRequest = undefined
}

module.exports.EntityRequest = EntityRequest

function getTransformKeys (options) {
  const transformKeys = TransformKeys.getTransformKeys(options)
  return transformKeys.map(key => {
    return Object.assign({}, key, {
      transform: createReducer(key.value)
    })
  })
}

function unsetTransformKeys (options, transformOptionKeys) {
  return transformOptionKeys.reduce((acc, transformKey) => {
    return fp.unset(transformKey.originalPath, acc)
  }, options)
}

module.exports.unsetTransformKeys = unsetTransformKeys

/**
 * creates new Request based on spec
 * @param  {Object} spec - request spec
 * @param {string} id - Entity id
 * @return {EntityRequest} Entity Object
 */
function create (spec, id) {
  const entity = createBaseEntity(EntityRequest, spec, id)
  const options = _.defaultTo(spec.options, {})
  entity.url = _.defaultTo(spec.url, '')
  if (spec.beforeRequest) {
    entity.beforeRequest = createReducer(spec.beforeRequest)
  }

  entity.transformOptionKeys = getTransformKeys(options)
  entity.options = unsetTransformKeys(options, entity.transformOptionKeys)

  return Object.freeze(entity)
}

module.exports.create = create
