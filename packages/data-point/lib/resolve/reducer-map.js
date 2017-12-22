const Promise = require('bluebird')
const set = require('lodash/set')
const utils = require('../utils')

/**
 * @param {Object} store
 * @param {Function} resolveTransform
 * @param {Accumulator} accumulator
 * @param {ReducerMap} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (store, resolveTransform, accumulator, reducer) {
  if (reducer.props.length === 0) {
    return Promise.resolve(accumulator)
  }

  const result = {}
  const promiseMap = Promise.map(reducer.props, ({ path, transform }) => {
    return resolveTransform(store, accumulator, transform).then(acc => {
      set(result, path, acc.value)
    })
  })

  return promiseMap.then(() => {
    return utils.set(accumulator, 'value', result)
  })
}

module.exports.resolve = resolve
