const { resolve } = require('./resolve')
const createBaseEntity = require('../base-entity').create
const { validateModifiers } = require('../validate-modifiers')

/**
 * @class
 */
function EntityEntry () {
  this.entityType = 'entry'
}

module.exports.EntityEntry = EntityEntry

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityEntry} Entity Object
 */
function create (id, spec) {
  validateModifiers(id, spec, [])
  const entity = createBaseEntity(id, spec, resolve, EntityEntry)
  return Object.freeze(entity)
}

module.exports.create = create
