const REDUCER_PARALLEL = 'ReducerParallel'

module.exports.type = REDUCER_PARALLEL

const HELPER_NAME = 'parallel'

module.exports.name = HELPER_NAME

/**
 * @class
 * @property {string} type
 * @property {Array<reducer>} reducers
 */
function ReducerParallel () {
  this.type = 'ReducerParallel'
  this.reducers = []
}

module.exports.ReducerParallel = ReducerParallel

/**
 * @param {Function} createReducer
 * @param {Array} source
 * @return {reducer}
 */
function create (createReducer, source) {
  const reducers = source.map(token => createReducer(token))

  const reducer = new ReducerParallel()
  reducer.reducers = reducers

  return reducer
}

module.exports.create = create
