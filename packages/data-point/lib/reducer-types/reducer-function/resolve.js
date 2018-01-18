const Promise = require('bluebird')

const utils = require('../../utils')
const { onReducerError } = require('../reducer-stack')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, stack) {
  let _stack = stack
  // TODO should we actually modify the function name in the factory?
  if (stack && reducer.body.name && reducer.body.prototype) {
    _stack = [...stack, [reducer.body.name]]
  }

  return Promise.try(() => reducer.body(accumulator))
    .then(value => utils.set(accumulator, 'value', value))
    .catch(error => onReducerError(_stack, accumulator.value, error))
}

module.exports.resolve = resolve
