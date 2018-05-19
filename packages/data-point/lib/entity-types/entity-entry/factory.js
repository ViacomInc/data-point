const { resolve } = require('./resolve')
const { EntityFactory } = require('../base-entity')
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
  const entity = Object.assign(new EntityEntry(), spec, {
    resolve
  })
  return entity
}

module.exports.create = EntityFactory('entry', create)
