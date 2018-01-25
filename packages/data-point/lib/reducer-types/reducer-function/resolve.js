const Promise = require('bluebird')
const utils = require('../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer) {
  return Promise.try(() => reducer.body(accumulator.value, accumulator)).then(
    value => {
      return utils.set(accumulator, 'value', value)
    }
  )
}

module.exports.resolve = resolve
