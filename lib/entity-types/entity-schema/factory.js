'use strict'

const _ = require('lodash')
const deepFreeze = require('deep-freeze')
const helpers = require('../../helpers')

/**
 * @class
 */
function EntitySchema () {
  this.schema = undefined
  this.options = {}
}

module.exports.EntitySchema = EntitySchema

/**
 * @param  {Object} spec - entity spec
 * @return {ControlEntity}
 */

function create (spec) {
  const entity = helpers.createEntity(EntitySchema, spec)
  entity.schema = deepFreeze(_.defaultTo(spec.schema, {}))
  entity.options = deepFreeze(_.defaultTo(spec.options, {}))

  return Object.freeze(entity)
}

module.exports.create = create
