const BaseEntity = require('../base-entity')
const { resolve } = require('./resolve')

/**
 * @class
 */
function EntityReducer () {}

module.exports.EntityReducer = EntityReducer

/**
 * Creates new Entity Object
 * @param  {*} spec - spec
 * @param {string} id - Entity id
 * @return {EntityTransform} Entity Object
 */
function create (id, spec) {
  const entity = new EntityReducer()
  entity.resolve = resolve
  entity.value = spec
  return entity
}

module.exports.create = BaseEntity.create('reducer', create)
