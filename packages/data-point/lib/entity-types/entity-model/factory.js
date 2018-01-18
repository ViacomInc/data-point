const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntityModel () {}

module.exports.EntityModel = EntityModel

/**
 * Creates new Entity Object
 * @param {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityModel} Entity Object
 */
function create (spec, id) {
  const entity = createBaseEntity(EntityModel, spec, id)
  return Object.freeze(entity)
}

module.exports.create = create
