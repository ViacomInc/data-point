'use strict'

const Promise = require('bluebird')
const partial = require('lodash/partial')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerList} reducerList
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerList) {
  if (reducerList.reducers.length === 0) {
    return Promise.resolve(accumulator)
  }

  const result = Promise.reduce(
    reducerList.reducers,
    partial(resolveReducer, manager),
    accumulator
  )

  return result
}

module.exports.resolve = resolve
