const Promise = require('bluebird')
const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} createReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFind} reducerFind
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, createReducer, accumulator, reducerFind) {
  const reducer = reducerFind.reducer
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }

  return Promise.reduce(
    accumulator.value,
    (result, itemValue) => {
      const itemContext = utils.set(accumulator, 'value', itemValue)
      return (
        result ||
        createReducer(manager, itemContext, reducer).then(res => {
          return res.value ? itemValue : undefined
        })
      )
    },
    null
  ).then(result => utils.set(accumulator, 'value', result))
}

module.exports.resolve = resolve