const Promise = require('bluebird')
const set = require('lodash/set')
const utils = require('../utils')

/**
 * @param {Object} store
 * @param {Function} resolveTransform
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (store, resolveTransform, accumulator, reducer) {
  if (reducer.props.length === 0) {
    return Promise.resolve(accumulator)
  }

  const props = Promise.map(reducer.props, ({ path, transform }) => {
    return resolveTransform(store, accumulator, transform).then(
      ({ value }) => ({ path, value })
    )
  })

  return props
    .reduce((acc, { path, value }) => set(acc, path, value), {})
    .then(value => utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
