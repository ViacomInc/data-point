const Promise = require('bluebird')
const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFilter} reducerFilter
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerFilter) {
  const reducer = reducerFilter.reducer
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }

  return Promise.filter(accumulator.value, itemValue => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveReducer(manager, itemContext, reducer).then(res => {
      return !!res.value
    })
  }).then(result => utils.set(accumulator, 'value', result))
}

module.exports.resolve = resolve
