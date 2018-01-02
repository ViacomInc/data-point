const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')

const createTransform = require('../../transform-expression').create

/**
 * @param {function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 * @param {string} id - Entity's id
 */
function create (Factory, spec, id) {
  const entity = new Factory(spec)

  entity.id = id
  entity.value = createTransform(spec.value)

  if (spec.before) {
    entity.before = createTransform(spec.before)
  }

  entity.error = createTransform(spec.error)
  if (spec.after) {
    entity.after = createTransform(spec.after)
  }

  entity.params = deepFreeze(defaultTo(spec.params, {}))

  return entity
}

module.exports.create = create
