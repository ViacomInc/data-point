const BaseEntity = require('../../../entity-types/base-entity/resolve')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFilter} reducerInstance
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerEntity) {
  return BaseEntity.resolve(
    manager,
    resolveReducer,
    accumulator,
    reducerEntity,
    reducerEntity.spec.resolve
  )
}

module.exports.resolve = resolve
