'use strict'

const helpers = require('../../helpers')

/**
 * Transform Type.
 * @class
 */
function Transform () {}

module.exports.Transform = Transform

function create (spec, id) {
  const entity = helpers.createEntity(Transform, spec)
  entity.id = id
  return Object.freeze(entity)
}

module.exports.create = create
