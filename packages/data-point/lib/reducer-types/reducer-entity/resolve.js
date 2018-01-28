const BaseEntity = require('../../entity-types/base-entity/resolve')

const { stackPush } = require('../../reducer-stack')

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
  // replace the 'ReducerEntity' string from
  // reducer-types#resolveReducer with the entity's id
  const _stack = stack ? stackPush(stack.slice(0, -1), reducer.id) : stack
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
