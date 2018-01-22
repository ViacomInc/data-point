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
  // do not add the name for arrow functions (which do not have a prototype)
  // some arrow functions have inferred names, which might be confusing
  // if they show up in the reducer stack trace
  if (stack && reducer.body.name && reducer.body.prototype) {
    stack = stackPush(stack, [reducer.body.name])
  }

  return Promise.try(() => reducer.body(accumulator))
    .then(value => utils.set(accumulator, 'value', value))
    .catch(error => onReducerError(stack, accumulator.value, error))
}

module.exports.resolve = resolve
