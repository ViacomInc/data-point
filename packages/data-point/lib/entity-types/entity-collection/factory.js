const parseCompose = require('../parse-compose')
const createBaseEntity = require('../base-entity').create
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
 * @param {Function} createReducer
 * @param {Array<Object>} composeSpec
 * @return {Reducer}
 */
function createCompose (createReducer, composeSpec) {
  const stubs = composeSpec.map(modifier => {
    const factory = modifiers[modifier.type]
    return factory(modifier.spec)
  })

  return createReducer(stubs)
}

/**
 * Creates new Entity Object
 * @param {Function} createReducer
 * @param {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityCollection} Entity Object
 */
function create (createReducer, spec, id) {
  validateModifiers(id, spec, modifierKeys.concat('compose'))

  const outputType = getTypeCheckSourceWithDefault(
    'collection',
    'array',
    spec.outputType
  )
  spec = Object.assign({}, spec, { outputType })

  const entity = createBaseEntity(createReducer, EntityCollection, spec, id)
  const compose = parseCompose.parse(id, modifierKeys, spec)
  if (compose.length) {
    entity.compose = createCompose(createReducer, compose)
  }

  return Object.freeze(entity)
}

module.exports.create = create
