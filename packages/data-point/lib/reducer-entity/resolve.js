'use strict'

const BaseEntity = require('../entity-types/base-entity/resolve')

/**
 * Resolve an Entity Reducer, actual entity resolution is delegated
 * to each Entity.resolve method
 * @param {Object} manager
 * @param {function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerEntity} reducerEntity
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerEntity) {
  const reducerEntityType = reducerEntity.entityType
  const EntityType = manager.entityTypes.get(reducerEntityType)
  return BaseEntity.resolve(
    manager,
    resolveReducer,
    accumulator,
    reducerEntity,
    EntityType.resolve
  )
}

module.exports.resolve = resolve
