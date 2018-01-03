'use strict'

const _ = require('lodash')

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
  this.type = REDUCER_ENTITY
  this.name = ''
  this.entityType = null
  this.asCollection = false
}

module.exports.ReducerEntity = ReducerEntity

/**
 * @param {*} source
 * @returns {boolean}
 */
function isEntity (source) {
  return (
    _.isString(source) &&
    source.match(/^([^$][\w.]*):([\w.-]+)(\[])?$/) !== null
  )
}

module.exports.isEntity = isEntity

/**
 * parse reducer
 * @param  {string} reducerRaw raw reducer path
 * @return {reducer}
 */
function create (source) {
  const reducer = new ReducerEntity()

  const tokens = source.split(':')

  reducer.entityType = tokens[0]
  reducer.name = tokens[1].replace(/\[]$/, '')
  reducer.asCollection = source.slice(-2) === '[]'
  reducer.id = `${reducer.entityType}:${reducer.name}`

  return Object.freeze(reducer)
}

module.exports.create = create
