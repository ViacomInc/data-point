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

  const reducer = reducerFind.reducer
  return Promise.reduce(
    accumulator.value,
    (result, itemValue) => {
      const itemContext = utils.set(accumulator, 'value', itemValue)
      return (
        result ||
        resolveReducer(manager, itemContext, reducer).then(value => {
          return reducerPredicateIsTruthy(reducer, value)
            ? itemValue
            : undefined
        })
      )
    },
    null
  )
}

module.exports.resolve = resolve
