'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const utils = require('../utils')

/**
 * applies reducer parameters and passes them to reducer function,
 * it is expected that the filterFunction will return a function
 * in return with the form of (acc, done) - node style callback
 *
 * @param {any} filterFunction
 * @param {any} reducerParameters
 * @returns
 */
function getReducerCallback (filterFunction, reducerParameters) {
  const parameterValues = _.map(reducerParameters, 'value')
  return filterFunction.apply(null, parameterValues)
}

module.exports.getReducerCallback = getReducerCallback

/**
 * get callback function from its ObjectStoreManager
 *
 * @param {any} filterStore
 * @param {any} reducerFunction
 * @returns
 */
function getCallbackFunction (filterStore, reducerFunction) {
  const filterFunction = filterStore.get(reducerFunction.name)
  const reducerParameters = reducerFunction.parameters

  return getReducerCallback(filterFunction, reducerParameters)
}

module.exports.getCallbackFunction = getCallbackFunction

/**
 * Resolve a ReducerFunction
 *
 * @param {ObjectStoreManager} filterStore
 * @param {Accumulator} accumulator
 * @param {ReducerFunction} reducerFunction
 * @returns {Promise<Accumulator>}
 */
function resolve (filterStore, accumulator, reducerFunction) {
  const callbackFunction = reducerFunction.isFunction
    ? reducerFunction.body
    : getCallbackFunction(filterStore, reducerFunction)

  if (typeof callbackFunction !== 'function') {
    const e = new Error(
      `ReducerFunction '${reducerFunction.name}' should return a function`
    )
    e.name = 'InvalidType'
    return Promise.reject(e)
  }

  if (callbackFunction.length > 2) {
    const e = new Error(
      `ReducerFunction '${reducerFunction.name}' must have at most an arity of 2`
    )
    e.name = 'InvalidArity'
    return Promise.reject(e)
  }

  const currentAccumulator = utils.set(
    accumulator,
    'currentFilter',
    reducerFunction
  )

  if (callbackFunction.length < 2) {
    return Promise.try(
      callbackFunction.bind(null, accumulator)
    ).then(result => {
      return utils.set(currentAccumulator, 'value', result)
    })
  }

  return new Promise((resolve, reject) => {
    // callbackFunction is expected to be a Node Style callback function
    // with the form of (acc, done)
    callbackFunction(accumulator, (err, value) => {
      if (err) {
        return reject(err)
      }
      resolve(utils.set(currentAccumulator, 'value', value))
    })
  })
}

module.exports.resolve = resolve
