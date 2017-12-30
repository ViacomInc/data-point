'use strict'

const BaseEntity = require('../entity-types/base-entity/resolve')

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
  return BaseEntity.resolve(
    store,
    resolveReducer,
    accumulator,
    reducerEntity,
    EntityType.resolve
  )
}

module.exports.resolve = resolve
