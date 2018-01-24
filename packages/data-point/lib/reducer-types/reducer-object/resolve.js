const Promise = require('bluebird')
const set = require('lodash/set')
const utils = require('../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer) {
  if (reducer.props.length === 0) {
    return Promise.resolve(accumulator)
  }

  return Promise.map(reducer.props, ({ path, reducer }) => {
    return resolveReducer(manager, accumulator, reducer).then(({ value }) => ({
      path,
      value
    }))
  }).then(result => {
    const value = result.reduce(
      (acc, { path, value }) => set(acc, path, value),
      {}
    )
    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
