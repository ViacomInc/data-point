const Promise = require('bluebird')

const ReducerEntity = require('./reducer-entity')
const ReducerEntityId = require('./reducer-entity-id')
const ReducerFunction = require('./reducer-function')
const ReducerList = require('./reducer-list')
const ReducerObject = require('./reducer-object')
const ReducerPath = require('./reducer-path')
const ReducerHelpers = require('./reducer-helpers').reducers
const { DEFAULT_VALUE } = require('./reducer-symbols')

const trace = require('../trace')

const reducers = Object.assign({}, ReducerHelpers, {
  [ReducerEntity.type]: ReducerEntity,
  [ReducerEntityId.type]: ReducerEntityId,
  [ReducerFunction.type]: ReducerFunction,
  [ReducerList.type]: ReducerList,
  [ReducerObject.type]: ReducerObject,
  [ReducerPath.type]: ReducerPath
})

/**
 * @param {Reducer} reducer
 * @return {boolean}
 */
function hasDefault (reducer) {
  return !!reducer[DEFAULT_VALUE]
}

module.exports.hasDefault = hasDefault

/**
 * @param {Reducer} reducer
 * @throws if reducer is not valid
 * @return {Function}
 */
function getResolveFunction (reducer) {
  const reducerType = reducers[reducer.type]
  if (reducerType) {
    return reducerType.resolve
  }

  throw new Error(`Reducer type '${reducer.type}' was not recognized`)
}

/**
 * Applies a Reducer to an accumulator
 *
 * If Accumulator.trace is true it will execute tracing actions
 *
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise}
 */
function resolveReducer (manager, accumulator, reducer) {
  // this conditional is here because BaseEntity#resolve
  // does not check that lifecycle methods are defined
  // before trying to resolve them
  if (!reducer) {
    return Promise.resolve(accumulator.value)
  }

  const isTracing = accumulator.trace

  const acc = isTracing
    ? trace.augmentAccumulatorTrace(accumulator, reducer)
    : accumulator

  const traceNode = acc.traceNode

  const resolve = getResolveFunction(reducer)

  // NOTE: recursive call
  let result = resolve(manager, resolveReducer, acc, reducer)

  if (hasDefault(reducer)) {
    const _default = reducer[DEFAULT_VALUE].value
    const resolveDefault = reducers.ReducerDefault.resolve
    result = result.then(value => resolveDefault(value, _default))
  }

  if (isTracing) {
    result = result.then(trace.augmentTraceNodeDuration(traceNode))
  }

  return result
}

module.exports.resolve = resolveReducer
