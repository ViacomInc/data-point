const { resolve } = require('./resolve')
const parseCompose = require('../parse-compose')
const createReducer = require('../../reducer-types').create
const { EntityFactory } = require('../base-entity')
const reducerHelpers = require('../../reducer-types/reducer-helpers')
const { validateModifiers } = require('../validate-modifiers')
const {
  getTypeCheckSourceWithDefault
} = require('../../helpers/type-check-helpers')
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
 * @return {Reducer}
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
function create (id, spec) {
  validateModifiers(id, spec, modifierKeys.concat('compose'))

  const outputType = getTypeCheckSourceWithDefault(
    'collection',
    'array',
    spec.outputType
  )

  const entity = Object.assign(new EntityCollection(), spec, {
    resolve,
    outputType
  })

  const compose = parseCompose.parse(id, modifierKeys, entity)
  if (compose.length) {
    entity.compose = createCompose(compose)
  }
  return entity
}

module.exports.create = EntityFactory('collection', create)
