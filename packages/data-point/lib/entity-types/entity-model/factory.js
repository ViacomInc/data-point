const BaseEntity = require('../base-entity')
const { resolve } = require('./resolve')

/**
 * @class
 */
function EntityModel () {}

module.exports.EntityModel = EntityModel

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityModel} Entity Object
 */
function create (id, spec) {
  const entity = new EntityModel()
  entity.spec = spec
  entity.resolve = resolve
  return entity
}

module.exports.create = BaseEntity.create('model', create)
