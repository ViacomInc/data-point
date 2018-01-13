const REDUCER_SYMBOL = require('../../reducer-symbol')

const REDUCER_ASSIGN = require('./type')

module.exports.type = REDUCER_ASSIGN

const HELPER_NAME = 'assign'

module.exports.name = HELPER_NAME

/**
 * @class
 * @property {string} type
 * @property {reducer} reducer
 */
function ReducerAssign () {
  this[REDUCER_SYMBOL] = true
  this.type = REDUCER_ASSIGN
  this.reducer = undefined
}

module.exports.ReducerAssign = ReducerAssign

/**
 * @param {Function} createReducer
 * @param {*} source - raw source for a reducer
 * @return {ReducerAssign}
 */
function create (createReducer, source) {
  const reducer = new ReducerAssign()
  reducer.reducer = createReducer(source)
  return reducer
}

module.exports.create = create
