'use strict'

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

function addToStore (store, reducers) {
  _.forOwn(reducers, (value, key) => {
    store.add(key, value, true)
  })
}

/**
 * setup store
 */
function addDefinitionsToStore (store, entities) {
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
    entryPoints: {}
  })

  const entityTypes = storeEntityTypes.create()

  const manager = {
    middleware: storeMiddleware.create(),
    values: storeValues.create(),
    entities: storeEntities.create(entityTypes),
    entityTypes
  }

  manager.transform = _.partial(transform, manager)

  // add single item (singlular)
  manager.addValue = manager.values.add
  manager.addEntityTypes = manager.entityTypes.add
  manager.use = manager.middleware.use

  // add collection of items (plural)
  manager.addEntities = _.partial(addDefinitionsToStore, manager.entities)

  // using options to initialize dataPoint

  // built-in entity types
  manager.addEntityTypes('transform', EntityTransform)
  manager.addEntityTypes('entry', EntityEntry)
  // alias to entry, may be used to process any object type
  manager.addEntityTypes('model', EntityEntry)
  manager.addEntityTypes('hash', EntityHash)
  manager.addEntityTypes('collection', EntityCollection)
  manager.addEntityTypes('request', EntityRequest)
  // for backwards compatibility
  manager.addEntityTypes('source', EntityRequest)
  manager.addEntityTypes('control', EntityControl)
  manager.addEntityTypes('schema', EntitySchema)

  addToStore(manager.values, options.values)
  addToStore(manager.entityTypes, options.entityTypes)
  manager.addEntities(options.entities)

  return manager
}

module.exports.create = create
