'use strict'

const Promise = require('bluebird')
const partial = require('lodash/partial')

/**
 * @param {Object} manager
 * @param {Function} resolveTransform
 * @param {Accumulator} accumulator
 * @param {ReducerList} reducerList
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveTransform, accumulator, reducerList) {
  if (reducerList.reducers.length === 0) {
    return Promise.resolve(accumulator)
  }

  const result = Promise.reduce(
    reducerList.reducers,
    partial(resolveTransform, manager),
    accumulator
  )

  return result
}

module.exports.resolve = resolve
