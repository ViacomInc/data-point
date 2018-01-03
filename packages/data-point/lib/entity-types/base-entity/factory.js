const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')

const createTransform = require('../../reducer').create

/**
 * @param {function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 * @param {string} id - Entity's id
 * @returns {entity}
 */
function create (Factory, spec, id) {
  const entity = new Factory(spec)

  entity.id = id
  entity.value = createTransform(spec.value)
  entity.before = createTransform(spec.before)
  entity.error = createTransform(spec.error)
  entity.after = createTransform(spec.after)
  entity.params = deepFreeze(defaultTo(spec.params, {}))

  return entity
}

module.exports.create = create
