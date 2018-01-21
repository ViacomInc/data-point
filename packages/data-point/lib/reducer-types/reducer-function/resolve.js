const Promise = require('bluebird')

const utils = require('../../utils')
const { stackPush, onReducerError } = require('../../reducer-stack')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, stack) {
  if (stack && reducer.body.name && reducer.body.prototype) {
    stack = stackPush(stack, [reducer.body.name])
  }

  return Promise.try(() => reducer.body(accumulator))
    .then(value => utils.set(accumulator, 'value', value))
    .catch(error => onReducerError(stack, accumulator.value, error))
}

module.exports.resolve = resolve
