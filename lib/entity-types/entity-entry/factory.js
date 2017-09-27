'use strict'

const helpers = require('../../helpers')

/**
 * EntityEntry Constructor
 * @class
 */
function EntityEntry () {}

module.exports.EntityEntry = EntityEntry

/**
 * Creates new ControlEntity based on spec
 * @param  {Object} spec - control spec
 * @return {ControlEntity}
 */
function create (spec) {
  const entity = helpers.createEntity(EntityEntry, spec)
  return Object.freeze(entity)
}

module.exports.create = create
