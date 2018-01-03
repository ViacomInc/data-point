'use strict'

const Promise = require('bluebird')
const partial = require('lodash/partial')

const resolveReducer = require('../reducer').resolve
const utils = require('../utils')

/**
 * resolves a given transform
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {reducer} transform
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, accumulator, transform) {
  if (utils.reducerIsEmpty(transform)) {
    return Promise.resolve(accumulator)
  }

  // NOTE: recursive call
  const reduceTransformReducer = partial(resolveReducer, manager, resolve)
  const result = Promise.reduce(
    transform.reducers,
    reduceTransformReducer,
    accumulator
  )

  return result
}

module.exports.resolve = resolve
