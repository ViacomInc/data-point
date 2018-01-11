const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntityTransform () {}

module.exports.EntityTransform = EntityTransform

/**
 * Creates new Entity Object
 * @param  {*} spec - spec
 * @param {string} id - Entity id
 * @return {EntityTransform} Entity Object
 */
function create (spec, id) {
  const entity = createBaseEntity(
    EntityTransform,
    {
      value: spec
    },
    id
  )
  return Object.freeze(entity)
}

module.exports.create = create
