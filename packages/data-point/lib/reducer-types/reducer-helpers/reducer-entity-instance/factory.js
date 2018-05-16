const REDUCER_ENTITY_INSTANCE = 'ReducerEntityInstance'

module.exports.type = REDUCER_ENTITY_INSTANCE

const HELPER_NAME = 'entity'

module.exports.name = HELPER_NAME

/**
 * @class
 * @property {string} type
 * @property {reducer} transform
 */
function ReducerEntityInstance () {
  this.type = REDUCER_ENTITY_INSTANCE
  this.transform = undefined
}

module.exports.Constructor = ReducerEntityInstance

/**
 * @param {Function} createReducer
 * @param {*} source - raw source for a reducer
 * @return {ReducerFilter}
 */
function create (createReducer, id, entity) {
  const reducer = new ReducerEntityInstance()
  reducer.id = id
  reducer.spec = entity
  return reducer
}

module.exports.create = create
