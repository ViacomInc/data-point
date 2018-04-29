const _ = require('lodash')

const Transform = require('./transform')
const normalizeEntities = require('./normalize-entities')
const entities = require('../entity-types').definitions

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
  manager.addEntityTypes = addToStore.bind(null, manager.entityTypes)

  manager.use = manager.middleware.use

  // add collection of items (plural)
  manager.addEntities = addEntitiesToStore.bind(null, manager.entities)

  // built-in entity types
  _.forOwn(entities, (definition, key) => {
    manager.addEntityType(key.toLowerCase(), definition)
  })

  // for backwards compatibility
  manager.addEntityType('transform', entities.Reducer)
  manager.addEntityType('source', entities.Request)

  addToStore(manager.values, options.values, true)

  manager.addEntityTypes(options.entityTypes, true)
  manager.addEntities(options.entities)

  // supports currying
  manager.resolve = Transform.resolve(manager)
  // does not support currying
  manager.transform = Transform.transform.bind(null, manager)
  // does not support currying
  manager.resolveFromAccumulator = Transform.resolveFromAccumulator.bind(
    null,
    manager
  )

  return manager
}

module.exports.create = create
