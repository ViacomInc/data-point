const _ = require('lodash')

/**
 * parse reducer
 * @param  {Entity} entitySpec user defined entity
 * @return {reducer}
 */
function create (entitySpec, id) {
  if (!_.isFunction(entitySpec)) {
    throw new Error(
      `Entity Factory '${id}' should be a function: ${JSON.stringify(entitySpec)}`
    )
  }

  if (entitySpec.length !== 2) {
    throw new Error(
      `Entity Factory '${id}' method should have an arity of 2, instead got: ${
        entitySpec.length
      }`
    )
  }

  return entitySpec
}

module.exports.create = create
