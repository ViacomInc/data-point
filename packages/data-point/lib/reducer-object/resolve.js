const Promise = require('bluebird')
const set = require('lodash/set')
const utils = require('../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveTransform
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveTransform, accumulator, reducer) {
  if (reducer.props.length === 0) {
    return Promise.resolve(accumulator)
  }

  const props = Promise.map(reducer.props, ({ path, transform }) => {
    return resolveTransform(manager, accumulator, transform).then(
      ({ value }) => ({ path, value })
    )
  })

  return props
    .reduce((acc, { path, value }) => set(acc, path, value), {})
    .then(value => utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
