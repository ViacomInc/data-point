const BaseEntity = require('../../entity-types/base-entity/resolve')

/**
 * Resolve an Entity Reducer, actual entity resolution is delegated
 * to each Entity.resolve method
 * @param {Object} manager
 * @param {function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerEntityId} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer) {
  const entity = manager.entities.get(reducer.id)
  return BaseEntity.resolve(
    manager,
    resolveReducer,
    accumulator,
    reducer,
    entity
  )
}

module.exports.resolve = resolve
