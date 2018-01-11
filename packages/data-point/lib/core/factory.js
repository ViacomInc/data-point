const _ = require('lodash')

const normalizeEntities = require('./normalize-entities')
const transform = require('./transform')

const storeValues = require('../stores/values')
const storeEntities = require('../stores/entities')
const storeEntityTypes = require('../stores/entity-types')
const storeMiddleware = require('../stores/middleware')

const EntityTransform = require('../entity-types/entity-transform')
const EntityEntry = require('../entity-types/entity-entry')
const EntityHash = require('../entity-types/entity-hash')
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
 * setup store
 */
function addEntitiesToStore (store, entities) {
  const entitySpecs = _.defaultTo(entities, {})
  const specs = normalizeEntities.normalize(entitySpecs)

  _.forOwn(specs, specItem => {
    store.add(specItem.id, specItem.spec)
  })

  return store
}

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

  manager.transform = _.partial(transform, manager)

  // add single item (singular)
  manager.addValue = manager.values.add
  manager.addEntityType = manager.entityTypes.add
  manager.addEntityTypes = _.partial(addToStore, manager.entityTypes)
  manager.use = manager.middleware.use

  // add collection of items (plural)
  manager.addEntities = _.partial(addEntitiesToStore, manager.entities)

  // using options to initialize dataPoint

  // built-in entity types
  manager.addEntityType('transform', EntityTransform)
  manager.addEntityType('entry', EntityEntry)
  // alias to entry, may be used to process any object type
  manager.addEntityType('model', EntityEntry)
  manager.addEntityType('hash', EntityHash)
  manager.addEntityType('collection', EntityCollection)
  manager.addEntityType('request', EntityRequest)
  // for backwards compatibility
  manager.addEntityType('source', EntityRequest)
  manager.addEntityType('control', EntityControl)
  manager.addEntityType('schema', EntitySchema)

  manager.addEntityTypes(options.entityTypes, true)

  addToStore(manager.values, options.values, true)

  manager.addEntities(options.entities)

  return manager
}

module.exports.create = create
