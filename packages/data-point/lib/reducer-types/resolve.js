const Promise = require('bluebird')
const ReducerEntity = require('./reducer-entity')
const ReducerFunction = require('./reducer-function')
const ReducerList = require('./reducer-list')
const ReducerObject = require('./reducer-object')
const ReducerPath = require('./reducer-path')

const ReducerHelpers = require('./reducer-helpers').reducers
const { onReducerError } = require('./reducer-stack')

const reducers = Object.assign({}, ReducerHelpers, {
  [ReducerEntity.type]: ReducerEntity,
  [ReducerFunction.type]: ReducerFunction,
  [ReducerList.type]: ReducerList,
  [ReducerObject.type]: ReducerObject,
  [ReducerPath.type]: ReducerPath
})

/**
 * apply a Reducer to an accumulator
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolveReducer (manager, accumulator, reducer, stack) {
  // this conditional is here because BaseEntity#resolve
  // does not check that lifecycle methods are defined
  // before trying to resolve them
  if (!reducer) {
    return Promise.resolve(accumulator)
  }

  const reducerType = reducers[reducer.type]
  if (!reducerType) {
    throw new Error(`Reducer type '${reducer.type}' was not recognized`)
  }

  const _stack = stack ? [...stack, reducer.type] : stack

  // NOTE: recursive call
  return reducerType
    .resolve(manager, resolveReducer, accumulator, reducer, _stack)
    .catch(error => onReducerError(_stack, accumulator.value, error))
}

module.exports.resolve = resolveReducer
