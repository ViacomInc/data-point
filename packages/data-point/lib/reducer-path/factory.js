'use strict'

const _ = require('lodash')

const REDUCER_PATH = (module.exports.type = 'ReducerPath')

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {Array} parameters - collection of  @see {@link Parameter} items
 */
function ReducerPath () {
  this.type = REDUCER_PATH
  this.name = ''
  this.body = undefined
  this.asCollection = false
}

module.exports.ReducerPath = ReducerPath

/**
 * @param {*} source
 * @returns {boolean}
 */
function isPath (source) {
  return _.isString(source) && source.charAt(0) === '$'
}

module.exports.isPath = isPath

const getAccValue = acc => acc.value

module.exports.getAccValue = getAccValue

const getFromAcc = jsonPath => acc => _.get(acc, jsonPath)

module.exports.getFromAcc = getFromAcc

const getFromAccValue = jsonPath => acc => _.get(acc.value, jsonPath)

module.exports.getFromAccValue = getFromAccValue

const mapFromAccValue = jsonPath => acc => {
  if (Array.isArray(acc.value)) {
    return _.map(acc.value, jsonPath)
  }

  return null
}

module.exports.mapFromAccValue = mapFromAccValue

/**
 * @param {string} jsonPath
 * @param {boolean} asCollection
 * @returns {Function}
 */
function getPathReducerFunction (jsonPath, asCollection) {
  if (jsonPath === '.' || _.isEmpty(jsonPath)) {
    return getAccValue
  }

  if (jsonPath.startsWith('..')) {
    return getFromAcc(jsonPath.slice(2))
  }

  if (asCollection) {
    return mapFromAccValue(jsonPath)
  }

  return getFromAccValue(jsonPath)
}

module.exports.getPathReducerFunction = getPathReducerFunction

/**
 * parse reducer
 * @param {string} source - raw reducer path
 * @return {reducer}
 */
function create (source) {
  const reducer = new ReducerPath()

  reducer.asCollection = source.slice(-2) === '[]'
  reducer.name = _.defaultTo(source.substr(1), '.').replace(/\[]$/, '')
  reducer.body = getPathReducerFunction(reducer.name, reducer.asCollection)

  return Object.freeze(reducer)
}

module.exports.create = create
