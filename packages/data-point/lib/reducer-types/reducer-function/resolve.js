const Promise = require('bluebird')

const utils = require('../../utils')
const { getErrorHandler } = require('../reducer-stack')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, stack) {
  // let _stack = stack
  // if (stack && callbackFunction.name) {
  //   _stack = [...stack.slice(0, -1), `${callbackFunction.name}()`]
  // }

  const _stack =
    stack && reducer.body.name ? [...stack, [reducer.body.name]] : stack

  return Promise.try(() => reducer.body(accumulator)).then(value => {
    return utils.set(accumulator, 'value', value)
  }).catch(getErrorHandler(_stack))
}

module.exports.resolve = resolve
