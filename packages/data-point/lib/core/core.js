const _ = require('lodash')

const normalizeEntities = require('./normalize-entities')
const Transform = require('./transform')

const storeValues = require('../stores/values')
const storeEntities = require('../stores/entities')
const storeEntityTypes = require('../stores/entity-types')
const storeMiddleware = require('../stores/middleware')

const EntityTransform = require('../entity-types/entity-transform')
const EntityEntry = require('../entity-types/entity-entry')
const EntityHash = require('../entity-types/entity-hash')
const EntityModel = require('../entity-types/entity-model')
const EntityCollection = require('../entity-types/entity-collection')
const EntityRequest = require('../entity-types/entity-request')
const EntityControl = require('../entity-types/entity-control')
const EntitySchema = require('../entity-types/entity-schema')

/**
 * @param {Object} store
 * @param {Object} items
 * @param {boolean} override
 */
function addToStore (store, items, override) {
  _.forOwn(items, (value, key) => {
    store.add(key, value, override)
  })
}

/**
 * @param {Object} store
 * @param {Object} entities
 * @return {Object}
 */
function addEntitiesToStore (store, entities) {
  const entitySpecs = _.defaultTo(entities, {})
  const specs = normalizeEntities.normalize(entitySpecs)
  _.forOwn(specs, specItem => {
    store.add(specItem.id, specItem.spec)
  })

  return store
}

/**
 * @param {Object} spec
 * @return {Object}
 */
function create (spec) {
  const options = _.defaultTo(spec, {
    values: {},
    reducers: {},
    entities: {},
    entityTypes: {}
  })

  const entityTypes = storeEntityTypes.create()

  const manager = {
    middleware: storeMiddleware.create(),
    values: storeValues.create(),
    entities: storeEntities.create(entityTypes),
    entityTypes
  }

  // add single item (singular)
  manager.addValue = manager.values.add

  manager.addEntityType = manager.entityTypes.add
  // add multiple entity types
  manager.addEntityTypes = _.partial(addToStore, manager.entityTypes)

  manager.use = manager.middleware.use

  // add collection of items (plural)
  manager.addEntities = _.partial(addEntitiesToStore, manager.entities)

  // built-in entity types
  manager.addEntityType('reducer', EntityTransform)
  manager.addEntityType('entry', EntityEntry)
  // alias to entry, may be used to process any object type
  manager.addEntityType('model', EntityModel)
  manager.addEntityType('hash', EntityHash)
  manager.addEntityType('collection', EntityCollection)
  manager.addEntityType('request', EntityRequest)
  // for backwards compatibility
  manager.addEntityType('transform', EntityTransform)
  manager.addEntityType('source', EntityRequest)
  manager.addEntityType('control', EntityControl)
  manager.addEntityType('schema', EntitySchema)

  addToStore(manager.values, options.values, true)

  manager.addEntityTypes(options.entityTypes, true)
  manager.addEntities(options.entities)

  // supports currying
  manager.resolve = Transform.resolve(manager)
  // does not support currying
  manager.transform = _.partial(Transform.transform, manager)

  return manager
}

module.exports.create = create
