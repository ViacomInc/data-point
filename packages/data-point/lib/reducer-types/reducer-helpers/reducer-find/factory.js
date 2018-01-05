const REDUCER_SYMBOL = require('../../reducer-symbol')

const REDUCER_FIND = 'ReducerFind'

module.exports.type = REDUCER_FIND

/**
 * @class
 * @property {string} type
 * @property {reducer} reducer
 */
function ReducerFind () {
  this[REDUCER_SYMBOL] = true
  this.type = REDUCER_FIND
  this.reducer = undefined
  this.isReducer = true
}

module.exports.ReducerFind = ReducerFind

/**
 * @param {Function} createReducer
 * @param {*} source - raw source for a reducer
 * @return {ReducerFind}
 */
function create (createReducer, source) {
  const reducer = new ReducerFind()
  reducer.reducer = createReducer(source)
  return reducer
}

module.exports.create = create
