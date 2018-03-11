const Promise = require('bluebird')

const utils = require('../../../utils')
const { reducerPredicateIsTruthy } = require('../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFilter} reducerFilter
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerFilter) {
  const reducer = reducerFilter.reducer
  return Promise.filter(accumulator.value, (itemValue, index) => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveReducer(manager, itemContext, reducer, index).then(res => {
      return reducerPredicateIsTruthy(reducer, res.value)
    })
  }).then(result => utils.set(accumulator, 'value', result))
}

module.exports.resolve = resolve
