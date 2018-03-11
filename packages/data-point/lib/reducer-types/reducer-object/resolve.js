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
  return Promise.map(reducer.reducers, ({ reducer, path }) => {
    return resolveReducer(manager, accumulator, reducer, [path]).then(
      ({ value }) => ({
        path,
        value
      })
    )
  }).then(result => {
    const value = result.reduce(
      (acc, { path, value }) => set(acc, path, value),
      reducer.source()
    )

    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
