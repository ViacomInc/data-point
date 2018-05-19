const { EntityFactory } = require('../base-entity')
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
  return Object.assign(new EntityModel(), spec, {
    resolve
  })
}

module.exports.create = EntityFactory('model', create)
