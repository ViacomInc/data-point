const REDUCER_ENTITY_INSTANCE = 'ReducerEntityInstance'

module.exports.type = REDUCER_ENTITY_INSTANCE

/**
 * Defines a entity reducer
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {string} entityType - type of entity
 */
function ReducerEntityInstance () {
  this.type = REDUCER_ENTITY_INSTANCE
  this.name = ''
  this.entityType = null
  this.asCollection = false
  this.hasEmptyConditional = false
}

module.exports.ReducerEntity = ReducerEntityInstance

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType (source) {
  return source && source.isEntityInstance === true
}

module.exports.isType = isType

/**
 * @param {Function} createReducer
 * @param {string} entity
 * @return {reducer}
 */
function create (createReducer, entity) {
  const reducer = new ReducerEntityInstance()

  reducer.hasEmptyConditional = false

  reducer.asCollection = false

  reducer.id = entity.id
  reducer.name = entity.name
  reducer.entityType = entity.entityType
  reducer.entity = entity
  // for backwards compatibity with accumulator API
  reducer.spec = entity

  return reducer
}

module.exports.create = create
