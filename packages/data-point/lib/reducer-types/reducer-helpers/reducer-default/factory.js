const REDUCER_DEFAULT = 'ReducerDefault'

module.exports.type = REDUCER_DEFAULT

const HELPER_NAME = 'withDefault'

module.exports.name = HELPER_NAME

/**
 * this is used as a decorator
 * it attaches a default value
 * to an existing reducer type
 * @param {Function} createReducer
 * @param {*} source - raw source for a reducer
 * @param {*} value
 * @return {reducer}
 */
function create (createReducer, source, value) {
  return createReducer(source, { default: value })
}

module.exports.create = create
