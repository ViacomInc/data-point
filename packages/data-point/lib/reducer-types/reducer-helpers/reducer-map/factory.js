const REDUCER_SYMBOL = require('../../reducer-symbol')

const REDUCER_MAP = 'ReducerMap'

module.exports.type = REDUCER_MAP

const HELPER_NAME = 'map'

module.exports.HELPER_NAME = HELPER_NAME

/**
 * @class
 * @property {string} type
 * @property {reducer} reducer
 */
function ReducerMap () {
  this[REDUCER_SYMBOL] = true
  this.type = REDUCER_MAP
  this.reducer = undefined
}

module.exports.ReducerMap = ReducerMap

/**
 * @param {Function} createReducer
 * @param {*} source - raw source for a reducer
 * @return {ReducerMap}
 */
function create (createReducer, source) {
  const reducer = new ReducerMap()
  reducer.reducer = createReducer(source)
  return reducer
}

module.exports.create = create
