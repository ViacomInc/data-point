'use strict'

const Promise = require('bluebird')
const partial = require('lodash/partial')

const resolveReducer = require('../reducer').resolve

/**
 * resolves a given transform
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {TransformExpression} transform
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, accumulator, transform) {
  if (!transform || transform.reducers.length === 0) {
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
