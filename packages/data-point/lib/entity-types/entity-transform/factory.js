'use strict'

const helpers = require('../../helpers')

/**
 * Transform Type.
 * @class
 */
function Transform () {}

module.exports.Transform = Transform

/**
 * Creates new Entity Object
 * @param  {*} spec - spec
 * @param {string} id - Entity id
 * @return {Transform} Entity Object
 */
function create (spec, id) {
  const entity = helpers.createEntity(
    Transform,
    {
      value: spec
    },
    id
  )
  return Object.freeze(entity)
}

module.exports.create = create
