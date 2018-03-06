const _ = require('lodash')

const Transform = require('./transform')
const normalizeEntities = require('./normalize-entities')
const entityTypeDefinitions = require('../entity-types').definitions

const storeValues = require('../stores/values')
const storeEntities = require('../stores/entities')
const storeEntityTypes = require('../stores/entity-types')
const storeMiddleware = require('../stores/middleware')

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

  // add single item (singular)
  manager.addValue = manager.values.add

  manager.addEntityType = manager.entityTypes.add
  // add multiple entity types
  manager.addEntityTypes = _.partial(addToStore, manager.entityTypes)

  manager.use = manager.middleware.use

  // add collection of items (plural)
  manager.addEntities = _.partial(addEntitiesToStore, manager.entities)

  // built-in entity types
  manager.addEntityType('reducer', entityTypeDefinitions.Transform)
  manager.addEntityType('entry', entityTypeDefinitions.Entry)
  // alias to entry, may be used to process any object type
  manager.addEntityType('model', entityTypeDefinitions.Model)
  manager.addEntityType('hash', entityTypeDefinitions.Hash)
  manager.addEntityType('collection', entityTypeDefinitions.Collection)
  manager.addEntityType('request', entityTypeDefinitions.Request)
  // for backwards compatibility
  manager.addEntityType('transform', entityTypeDefinitions.Transform)
  manager.addEntityType('source', entityTypeDefinitions.Request)
  manager.addEntityType('control', entityTypeDefinitions.Control)
  manager.addEntityType('schema', entityTypeDefinitions.Schema)

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
