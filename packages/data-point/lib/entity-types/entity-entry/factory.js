const { resolve } = require('./resolve')
const BaseEntity = require('../base-entity')
const { validateModifiers } = require('../validate-modifiers')

/**
 * @class
 */
function EntityEntry () {}

module.exports.EntityEntry = EntityEntry

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityEntry} Entity Object
 */
function create (id, spec) {
  validateModifiers(id, spec, [])
  const entity = new EntityEntry()
  entity.spec = spec
  entity.resolve = resolve
  return entity
}

module.exports.create = BaseEntity.create('entry', create)
