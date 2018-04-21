const Promise = require('bluebird')

const utils = require('../../../utils')
const { reducerPredicateIsTruthy } = require('../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFind} reducerFind
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerFind) {
  if (accumulator.value.length === 0) {
    return Promise.resolve(undefined)
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
      return resolveReducer(manager, itemContext, reducer).then(value => {
        if (reducerPredicateIsTruthy(reducer, value)) {
          hasResult = true
          return itemValue
        }
      })
    },
    null
  )
}

module.exports.resolve = resolve
