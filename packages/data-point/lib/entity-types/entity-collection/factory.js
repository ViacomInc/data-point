'use strict'

const parseCompose = require('../parse-compose')
const createReducer = require('../../reducer-types').create
const createBaseEntity = require('../base-entity').create
const reducerHelpers = require('../../reducer-types/reducer-helpers')

/**
 * @class
 */
function EntityCollection () {}

module.exports.EntityCollection = EntityCollection

const modifierKeys = ['filter', 'map', 'find']

const modifiers = {
  filter: reducerHelpers.stubFactories.filter,
  find: reducerHelpers.stubFactories.find,
  map: reducerHelpers.stubFactories.map
}

/**
 * @param {Array<Object>} composeSpec
 * @return {Array<Object>}
 */
function createCompose (composeSpec) {
  const stubs = composeSpec.map(modifier => {
    const factory = modifiers[modifier.type]
    return factory(modifier.spec)
  })

  return createReducer(stubs)
}

/**
 * Creates new Entity Object
 * @param {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityCollection} Entity Object
 */
function create (spec, id) {
  parseCompose.validateComposeModifiers(spec, modifierKeys)

  const entity = createBaseEntity(EntityCollection, spec, id)

  const composeSpec = parseCompose.parse(spec, modifierKeys)
  parseCompose.validateCompose(entity.id, composeSpec, modifierKeys)

  entity.compose = createCompose(composeSpec)

  return Object.freeze(entity)
}

module.exports.create = create
