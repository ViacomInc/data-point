const Promise = require('bluebird')
const get = require('lodash/get')
const set = require('lodash/set')
const utils = require('../utils')

/**
 * @param {Object} store
 * @param {Function} resolve
 * @param {Accumulator} accumulator
 * @param {ReducerMap} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (store, resolver, accumulator, reducer) {
  if (reducer.keyMap.length === 0) {
    return Promise.resolve(accumulator)
  }

  const promiseMap = {}
  reducer.keyMap.forEach(keyData => {
    let newValue
    if (keyData.isTransform) {
      newValue = resolver(store, accumulator, keyData.value).then(
        acc => acc.value
      )
    } else {
      newValue = get(accumulator.value, keyData.value)
    }

    return set(promiseMap, keyData.path, newValue)
  })

  return Promise.props(promiseMap).then(value => {
    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
