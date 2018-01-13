const BaseEntity = require('../../entity-types/base-entity/resolve')

/**
 * Resolve an Entity Reducer, actual entity resolution is delegated
 * to each Entity.resolve method
 * @param {Object} manager
 * @param {function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerEntity} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, stack) {
  const reducerEntityType = reducer.entityType
  const EntityType = manager.entityTypes.get(reducerEntityType)
  const _stack = stack ? [...stack, [reducer.id]] : stack
  return BaseEntity.resolve(
    manager,
    resolveReducer,
    accumulator,
    reducer,
    EntityType.resolve,
    _stack
  )
}

module.exports.resolve = resolve
