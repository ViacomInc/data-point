const _ = require('lodash')

const REDUCER_ENTITY_ID = 'ReducerEntityId'

module.exports.type = REDUCER_ENTITY_ID

/**
 * Defines a entity reducer
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {string} entityType - type of entity
 */
function ReducerEntityId () {
  this.type = REDUCER_ENTITY_ID
  this.name = ''
  this.entityType = null
  this.asCollection = false
  this.hasEmptyConditional = false
}

module.exports.ReducerEntityId = ReducerEntityId

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType (source) {
  return (
    _.isString(source) &&
    source.match(/^([^$][\w.]*):([\w.-]+)(\[])?$/) !== null
  )
}

module.exports.isType = isType

/**
 * @param {Function} createReducer
 * @param {string} source
 * @return {reducer}
 */
function create (createReducer, source) {
  const reducer = new ReducerEntityId()
  const tokens = source.split(':')

  const entityType = tokens[0]
  reducer.hasEmptyConditional = entityType.indexOf('?') === 0
  reducer.entityType = entityType.replace(/^\?/, '')

  const name = tokens[1]
  reducer.asCollection = name.slice(-2) === '[]'
  reducer.name = name.replace(/\[]$/, '')

  reducer.id = `${reducer.entityType}:${reducer.name}`

  return reducer
}

module.exports.create = create
