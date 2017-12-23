'use strict'

const _ = require('lodash')
const deepFreeze = require('deep-freeze')
const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntitySchema () {
  this.schema = undefined
  this.options = {}
}

module.exports.EntitySchema = EntitySchema

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntitySchema} Entity Object
 */
function create (spec, id) {
  const entity = createBaseEntity(EntitySchema, spec, id)
  entity.schema = deepFreeze(_.defaultTo(spec.schema, {}))
  entity.options = deepFreeze(_.defaultTo(spec.options, {}))

  return Object.freeze(entity)
}

module.exports.create = create
