const last = require('lodash/last')

/**
 * used by ReducerDefault to check
 * when the default should be used
 * @param {*} value
 * @return {boolean}
 */
function reducerOutputIsFalsy (value) {
  return (
    value === null ||
    typeof value === 'undefined' ||
    Number.isNaN(value) ||
    value === ''
  )
}

module.exports.reducerOutputIsFalsy = reducerOutputIsFalsy

/**
 * used by ReducerFilter and ReducerFind
 * @param {Reducer} reducer
 * @param {*} output
 * @return {boolean}
 */
function reducerPredicateIsTruthy (reducer, output) {
  if (reducer.type === 'ReducerList') {
    reducer = last(reducer.reducers) || {}
  }

  if (reducer.type === 'ReducerObject') {
    const keys = Object.keys(output)
    return (
      !!keys.length &&
      keys.every(key => {
        return !reducerOutputIsFalsy(output[key])
      })
    )
  }

  return !!output
}

module.exports.reducerPredicateIsTruthy = reducerPredicateIsTruthy
