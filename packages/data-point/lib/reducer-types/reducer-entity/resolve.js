
const BaseEntity = require('../../entity-types/base-entity/resolve')

/**
 * Resolve an Entity Reducer, actual entity resolution is delegated
 * to each Entity.resolve method
 * @param {Object} manager
 * @param {function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerEntity} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer) {
  const reducerEntityType = reducer.entityType
  const EntityType = manager.entityTypes.get(reducerEntityType)
  return BaseEntity.resolve(
    manager,
    resolveReducer,
    accumulator,
    reducer,
    EntityType.resolve
  )
}

module.exports.resolve = resolve
