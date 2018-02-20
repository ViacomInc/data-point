const last = require('lodash/last')

/**
 * used by ReducerDefault to check
 * when the default should be used
 * @param {*} value
 * @return {boolean}
 */
function isFalsy (value) {
  return (
    value === null ||
    typeof value === 'undefined' ||
    Number.isNaN(value) ||
    value === ''
  )
}

module.exports.isFalsy = isFalsy

/**
 * @param {Reducer} reducer
 * @param {*} output
 * @return {boolean}
 */
function reducerPredicateIsTruthy (reducer, output) {
  // this, combined with the second conditional, is needed
  // when the last reducer in a list is a ReducerObject
  if (reducer.type === 'ReducerList') {
    reducer = last(reducer.reducers)
  }

  // when a ReducerObject is used as a predicate, the
  // output is truthy when all the values are truthy
  if (reducer && reducer.type === 'ReducerObject') {
    const keys = Object.keys(output)
    return !!keys.length && keys.every(key => !isFalsy(output[key]))
  }

  return !!output
}

module.exports.reducerPredicateIsTruthy = reducerPredicateIsTruthy
