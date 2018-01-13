const Promise = require('bluebird')
const set = require('lodash/set')

const utils = require('../../utils')
const { getErrorHandler } = require('../reducer-stack')
const REDUCER_OBJECT = require('./type')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, stack) {
  if (reducer.props.length === 0) {
    return Promise.resolve(accumulator)
  }

  const props = Promise.map(reducer.props, ({ path, reducer }) => {
    const _stack = stack ? stack.concat([REDUCER_OBJECT, path]) : stack
    return resolveReducer(manager, accumulator, reducer, _stack)
      .then(({ value }) => ({
        path,
        value
      }))
      .catch(getErrorHandler(_stack))
  })

  return props
    .reduce((acc, { path, value }) => set(acc, path, value), {})
    .then(value => utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
