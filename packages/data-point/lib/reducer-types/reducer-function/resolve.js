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
  const callbackFunction = reducer.body

  // let _stack = stack
  // if (stack && callbackFunction.name) {
  //   _stack = [...stack.slice(0, -1), `${callbackFunction.name}()`]
  // }

  const _stack =
    stack && callbackFunction.name ? [...stack, [callbackFunction.name]] : stack

  const onError = getErrorHandler(_stack)
  if (callbackFunction.length === 2) {
    // if the arity is 2, we expect a Node Style
    // callback function with the form of (acc, done)
    return new Promise((resolve, reject) => {
      callbackFunction(accumulator, (err, value) => {
        if (err) {
          return onError(err, reject)
        }

        resolve(utils.set(accumulator, 'value', value))
      })
    })
  }

  // callbackFunction is assumed to be either sync
  // or Promise returned value
  return Promise.try(() => callbackFunction(accumulator))
    .then(value => utils.set(accumulator, 'value', value))
    .catch(onError)
}

module.exports.resolve = resolve
