
const _ = require('lodash')
const utils = require('../../utils')

/**
 * parse reducer
 * @param  {Entity} entitySpec user defined entity
 * @return {reducer}
 */
function create (entitySpec, id) {
  if (!_.isFunction(entitySpec.create)) {
    throw new Error(
      `Entity Module '${
        id
      }' should expose a 'create' method, instead got: ${Object.keys(
        entitySpec
      )}`
    )
  }

  if (!_.isFunction(entitySpec.resolve)) {
    throw new Error(
      `Entity Module '${
        id
      }' should expose a 'resolve' method, instead got: ${Object.keys(
        entitySpec
      )}`
    )
  }

  if (entitySpec.resolve.length !== 2) {
    throw new Error(
      `Entity Module '${
        id
      }' 'resolve' method should have an arity of 2, instead got: ${
        entitySpec.resolve.length
      }`
    )
  }

  const entity = utils.set(entitySpec, 'id', id)
  return Object.freeze(entity)
}

module.exports.create = create
