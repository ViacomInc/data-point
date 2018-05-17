const createBaseEntity = require('../base-entity').create
const { resolve } = require('./resolve')

/**
 * @class
 */
function EntityTransform () {
  this.entityType = 'transform'
}

module.exports.EntityTransform = EntityTransform

/**
 * Creates new Entity Object
 * @param  {*} spec - spec
 * @param {string} id - Entity id
 * @return {EntityTransform} Entity Object
 */
function create (id, spec) {
  const entitySpec = {
    value: spec
  }
  const entity = createBaseEntity(id, entitySpec, resolve, EntityTransform)
  return Object.freeze(entity)
}

module.exports.create = create
