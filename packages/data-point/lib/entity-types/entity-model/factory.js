const createBaseEntity = require('../base-entity').create
const { resolve } = require('./resolve')

/**
 * @class
 */
function EntityModel () {
  this.entityType = 'model'
}

module.exports.EntityModel = EntityModel

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityModel} Entity Object
 */
function create (id, spec) {
  const entity = createBaseEntity(id, spec, resolve, EntityModel)
  return Object.freeze(entity)
}

module.exports.create = create
