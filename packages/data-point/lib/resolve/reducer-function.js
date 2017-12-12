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
  // if the accumulator already as a resolvedValue, return the accumulator without updating
  if (accumulator.isResolved) {
    return accumulator
  }

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
      `ReducerFunction '${
        reducerFunction.name
      }' must have at most an arity of 2`
    )
    e.name = 'InvalidArity'
    return Promise.reject(e)
  }

  const currentAccumulator = utils.set(
    accumulator,
    'currentFilter',
    reducerFunction
  )

  if (callbackFunction.length === 2) {
    // callbackFunction is expected to be a Node Style
    // callback function with the form of (acc, done)
    return new Promise((resolve, reject) => {
      callbackFunction(accumulator, (err, value) => {
        if (err) {
          return reject(err)
        }

        // if the result is a resolved value then return the accumulator with that value and a resolvedValue
        if (value.isResolved) {
          return utils.assign(currentAccumulator, value)
        }

        resolve(utils.set(currentAccumulator, 'value', value))
      })
    })
  }

  // callbackFunction is assumed to be either sync
  // or Promise returned value
  return Promise.try(callbackFunction.bind(null, accumulator))
    .then(result => {
      // if the result is a resolved value then return the accumulator with that value and a resolvedValue
      if (result.isResolved) {
        return utils.assign(currentAccumulator, result)
      }

      return utils.set(currentAccumulator, 'value', result)
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports.resolve = resolve
