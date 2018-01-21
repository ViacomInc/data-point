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
  let _stack
  // TODO should we actually modify the function name in the factory?
  // TODO refactor this
  if (stack && reducer.body.name && reducer.body.prototype) {
    _stack = stack ? stackPush(stack, [reducer.body.name]) : stack
  } else {
    _stack = stack ? stack.concat() : stack
  }

  return Promise.try(() => reducer.body(accumulator))
    .then(value => utils.set(accumulator, 'value', value))
    .catch(error => onReducerError(_stack, accumulator.value, error))
}

module.exports.resolve = resolve
