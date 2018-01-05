const REDUCER_SYMBOL = require('../../reducer-symbol')

const REDUCER_PICK = 'ReducerPick'

module.exports.type = REDUCER_PICK

/**
 * @class
 * @property {string} type
 * @property {Array<string>} keys
 */
function ReducerPick () {
  this[REDUCER_SYMBOL] = true
  this.type = REDUCER_PICK
  this.keys = undefined
  this.isReducer = true
}

module.exports.ReducerPick = ReducerPick

/**
 * @param {Function} createReducer
 * @param {Array<string>} keys
 * @return {ReducerPick}
 */
function create (createReducer, keys) {
  const reducer = new ReducerPick()
  reducer.keys = Object.freeze(keys.slice(0))
  return reducer
}

module.exports.create = create
