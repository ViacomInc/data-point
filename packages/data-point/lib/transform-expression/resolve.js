'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const resolveReducerPath = require('../reducer-path').resolve
const resolveReducerFunction = require('../reducer-function').resolve
const resolveReducerEntity = require('../reducer-entity').resolve

/**
 *
 *
 * @param {Object} store
 * @param {any} reducerType
 * @returns
 */
function getReducerFunction (store, reducerType) {
  let reducerResolver

  /* eslint indent: ["error", 2, { "SwitchCase": 1 }] */
  switch (reducerType) {
    case 'ReducerPath':
      reducerResolver = resolveReducerPath
      break
    case 'ReducerFunction':
      reducerResolver = resolveReducerFunction
      break
    case 'ReducerEntity':
      /* eslint no-use-before-define: "off" */
      // IMPORTANT: recursiveness here - watch out!
      reducerResolver = _.partial(resolveReducerEntity, store, resolve)
      break
    default:
      throw new Error(`Reducer type '${reducerType}' was not recognized`)
  }

  return reducerResolver
}

module.exports.getReducerFunction = getReducerFunction

/**
 * apply a Reducer to a accumulator
 *
 * @param {Object} store
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise<Accumulator>}
 */
function resolveReducer (store, accumulator, reducer) {
  const reducerFunction = getReducerFunction(store, reducer.type)
  const result = reducerFunction(accumulator, reducer)
  return result
}

module.exports.resolveReducer = resolveReducer

const reduceContext = store => (accumulator, reducer) => {
  return resolveReducer(store, accumulator, reducer)
}

module.exports.reduceContext = reduceContext

/**
 * resolves a given transform
 *
 * @param {Object} store
 * @param {Accumulator} accumulator
 * @param {any} transform
 * @returns {Promise<Accumulator>}
 */
function resolve (store, accumulator, transform) {
  if (transform.reducers.length === 0) {
    return Promise.resolve(accumulator)
  }

  const reduceTransformReducer = reduceContext(store)
  const result = Promise.reduce(
    transform.reducers,
    reduceTransformReducer,
    accumulator
  )

  return result
}

module.exports.resolve = resolve
