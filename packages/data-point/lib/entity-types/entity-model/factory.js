const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntityModel () {}

module.exports.EntityModel = EntityModel

/**
 * Creates new Entity Object
 * @param {Function} createReducer
 * @param {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityModel} Entity Object
 */
function create (createReducer, spec, id) {
  const entity = createBaseEntity(createReducer, EntityModel, spec, id)
  return Object.freeze(entity)
}

module.exports.create = create
