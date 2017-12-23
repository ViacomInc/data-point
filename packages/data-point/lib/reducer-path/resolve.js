'use strict'

const utils = require('../utils')

/**
 * @param {Accumulator} accumulator - current accumulator
 * @param {ReducerPath} reducerPath
 * @returns {Promise<Accumulator>}
 */
function resolve (accumulator, reducerPath) {
  const value = reducerPath.body(accumulator)
  const acc = utils.set(accumulator, 'value', value)
  return Promise.resolve(acc)
}

module.exports.resolve = resolve
