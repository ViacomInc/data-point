const REDUCER_FILTER = 'ReducerFilter'

module.exports.type = REDUCER_FILTER

const HELPER_NAME = 'filter'

module.exports.name = HELPER_NAME

/**
 * @class
 * @property {string} type
 * @property {reducer} transform
 */
function ReducerFilter () {
  this.type = REDUCER_FILTER
  this.transform = undefined
}

module.exports.ReducerFilter = ReducerFilter

/**
 * @param {Function} createReducer
 * @param {*} source - raw source for a reducer
 * @return {ReducerFilter}
 */
function create (createReducer, source) {
  const reducer = new ReducerFilter()
  reducer.reducer = createReducer(source)
  return reducer
}

module.exports.create = create
