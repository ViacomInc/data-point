const { resolve } = require('./resolve')
const BaseEntity = require('../base-entity')
const { validateModifiers } = require('../validate-modifiers')

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {Object} Entity Object
 */
function create (id, spec) {
  validateModifiers(id, spec, [])
  const entity = {}
  entity.spec = spec
  return entity
}

module.exports.create = BaseEntity.create('entry', create, resolve)
