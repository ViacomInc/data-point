const Promise = require('bluebird')

const utils = require('../../../utils')
const { reducerPredicateIsTruthy } = require('../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFind} reducerFind
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerFind) {
  if (accumulator.value.length === 0) {
    return Promise.resolve(utils.set(accumulator, 'value', undefined))
  }

  let hasResult = false
  const reducer = reducerFind.reducer
  return Promise.reduce(
    accumulator.value,
    (result, itemValue) => {
      if (hasResult) {
        return result
      }
      const itemContext = utils.set(accumulator, 'value', itemValue)
      return resolveReducer(manager, itemContext, reducer).then(res => {
        if (reducerPredicateIsTruthy(reducer, res.value)) {
          hasResult = true
          return itemValue
        }
      })
    },
    null
  ).then(result => utils.set(accumulator, 'value', result))
}

module.exports.resolve = resolve
