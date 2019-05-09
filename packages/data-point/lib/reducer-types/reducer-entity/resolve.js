const BaseEntity = require('../../entity-types/base-entity/resolve')

/**
 * Resolve an Entity Reducer, actual entity resolution is delegated
 * to each Entity.resolve method
 * @param {Object} manager
 * @param {function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerEntity} reducer
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducer) {
  return BaseEntity.resolve(
    manager,
    resolveReducer,
    accumulator,
    reducer,
    reducer.entity
  )
}

module.exports.resolve = resolve
