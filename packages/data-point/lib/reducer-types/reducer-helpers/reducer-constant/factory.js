const REDUCER_CONSTANT = 'ReducerConstant'

module.exports.type = REDUCER_CONSTANT

const HELPER_NAME = 'constant'

module.exports.name = HELPER_NAME

/**
 * @class
 * @property {string} type
 * @property {*} value
 */
function ReducerConstant () {
  this.type = REDUCER_CONSTANT
  this.value = undefined
}

module.exports.ReducerConstant = ReducerConstant

/**
 * @param {Function} createReducer
 * @param {*} value
 * @return {ReducerConstant}
 */
function create (createReducer, value) {
  const reducer = new ReducerConstant()
  reducer.value = value

  return reducer
}

module.exports.create = create
