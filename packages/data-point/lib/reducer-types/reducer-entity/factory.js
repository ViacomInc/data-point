'use strict'

const _ = require('lodash')

const REDUCER_SYMBOL = require('../reducer-symbol')

const REDUCER_ENTITY = 'ReducerEntity'

module.exports.type = REDUCER_ENTITY

/**
 * Defines a entity reducer
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {string} entityType - type of entity
 */
function ReducerEntity () {
  this[REDUCER_SYMBOL] = true
  this.type = REDUCER_ENTITY
  this.name = ''
  this.entityType = null
  this.asCollection = false
  this.withEmptyConditional = false
}

module.exports.ReducerEntity = ReducerEntity

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
  const reducer = new ReducerEntity()
  const tokens = source.split(':')

  let entityType = tokens[0]
  reducer.hasEmptyConditional = entityType.indexOf('?') === 0
  reducer.entityType = entityType.replace(/^\?/, '')

  let name = tokens[1]
  reducer.asCollection = name.slice(-2) === '[]'
  reducer.name = name.replace(/\[]$/, '')

  reducer.id = `${reducer.entityType}:${reducer.name}`

  return Object.freeze(reducer)
}

module.exports.create = create
