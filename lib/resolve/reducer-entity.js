'use strict'

const ResolveEntity = require('../entity-types/resolve-entity')

/**
 * Resolve an Entity Reducer, actual entity resolution is delegated
 * to each Entity.resolve method
 *
 * @param {Object} store
 * @param {function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerEntity} reducerEntity
 * @returns {Promise<Accumulator>}
 */
function resolve (store, resolveReducer, accumulator, reducerEntity) {
  const reducerEntityType = reducerEntity.entityType
  const EntityType = store.entityTypes.get(reducerEntityType)
  return ResolveEntity.resolve(
    store,
    resolveReducer,
    accumulator,
    reducerEntity,
    EntityType.resolve
  )
}

module.exports.resolve = resolve
