const Promise = require('bluebird')
const castArray = require('lodash/castArray')

const ReducerEntity = require('./reducer-entity')
const ReducerFunction = require('./reducer-function')
const ReducerList = require('./reducer-list')
const ReducerObject = require('./reducer-object')
const ReducerPath = require('./reducer-path')
const ReducerHelpers = require('./reducer-helpers').reducers
const { DEFAULT_VALUE } = require('./reducer-symbols')

const reducers = Object.assign({}, ReducerHelpers, {
  [ReducerEntity.type]: ReducerEntity,
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
 * apply a Reducer to an accumulator
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @param {Array|String|Number} key - id for reducer stack traces if an error is thrown
 * @returns {Promise<Accumulator>}
 */
function resolveReducer (manager, accumulator, reducer, key) {
  // this conditional is here because BaseEntity#resolve
  // does not check that lifecycle methods are defined
  // before trying to resolve them
  if (!reducer) {
    return Promise.resolve(accumulator)
  }

  // storing this in case we need it for the catch block, since we
  // can't trust it won't be overwritten in the accumulator object
  // although it could still be modified by reference if it's an object
  const value = accumulator.value
  const result = Promise.try(() => getResolveFunction(reducer))
    // NOTE: recursive call
    .then(resolve => resolve(manager, resolveReducer, accumulator, reducer))

  if (hasDefault(reducer)) {
    const _default = reducer[DEFAULT_VALUE].value
    const resolveDefault = reducers.ReducerDefault.resolve
    return result.then(acc => resolveDefault(acc, _default))
  }

  return result.catch(error => onResolveMalfunction(reducer, key, value, error))
}

module.exports.resolve = resolveReducer

/**
 * @param {Reducer} reducer
 * @param {Array|String|Number} key
 * @param {*} input
 * @param {Error} error
 * @throws the given error with _input and _stack properties attached
 */
function onResolveMalfunction (reducer, key, input, error) {
  if (!error.hasOwnProperty('_input')) {
    error._input = input
  }

  let stack
  if (typeof key === 'undefined') {
    stack = []
  } else {
    stack = castArray(key)
  }

  if (reducer.type === 'ReducerFunction') {
    stack.push(`${reducer.name || reducer.type}()`)
  } else if (reducer.type === 'ReducerEntity') {
    stack.push(reducer.id)
  } else {
    stack.push(reducer.type)
  }

  if (error._stack) {
    stack = stack.concat(error._stack)
  }

  error._stack = stack
  throw error
}
