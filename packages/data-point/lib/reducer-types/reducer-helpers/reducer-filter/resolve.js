const Promise = require('bluebird')

const utils = require('../../../utils')
const { reducerPredicateIsTruthy } = require('../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFilter} reducerFilter
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerFilter) {
  const reducer = reducerFilter.reducer
  return Promise.filter(accumulator.value, itemValue => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveReducer(manager, itemContext, reducer).then(value => {
      return reducerPredicateIsTruthy(reducer, value)
    })
  })
}

module.exports.resolve = resolve
