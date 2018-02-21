const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntityTransform () {}

module.exports.EntityTransform = EntityTransform

/**
 * Creates new Entity Object
 * @param {Function} createReducer
 * @param {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityTransform} Entity Object
 */
function create (createReducer, spec, id) {
  const entity = createBaseEntity(
    createReducer,
    EntityTransform,
    {
      value: spec
    },
    id
  )
  return Object.freeze(entity)
}

module.exports.create = create
