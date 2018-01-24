const REDUCER_AS_ARRAY = 'ReducerAsArray'

module.exports.type = REDUCER_AS_ARRAY

const HELPER_NAME = 'asArray'

module.exports.name = HELPER_NAME

/**
 * @class
 * @property {string} type
 * @property {Array<reducer>} reducers
 */
function ReducerAsArray () {
  this.type = 'ReducerAsArray'
  this.reducers = []
}

module.exports.ReducerAsArray = ReducerAsArray

/**
 * @param {Function} createReducer
 * @param {Array} source
 * @return {reducer}
 */
function create (createReducer, source = []) {
  const reducers = source.map(token => createReducer(token))

  const reducer = new ReducerAsArray()
  reducer.reducers = reducers

  return reducer
}

module.exports.create = create
