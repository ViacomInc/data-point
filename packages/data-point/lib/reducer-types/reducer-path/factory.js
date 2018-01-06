'use strict'

const _ = require('lodash')

const REDUCER_PATH = 'ReducerPath'

module.exports.type = REDUCER_PATH

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
function isType (source) {
  return _.isString(source) && source.charAt(0) === '$'
}

module.exports.isType = isType

/**
 * @param {Accumulator} acc
 * @returns {*}
 */
function getAccumulatorValue (acc) {
  return acc.value
}

module.exports.getAccumulatorValue = getAccumulatorValue

/**
 * @param {string} jsonPath
 * @param {Accumulator} acc
 * @returns {*}
 */
function getFromAccumulator (jsonPath, acc) {
  return _.get(acc, jsonPath)
}

module.exports.getFromAccumulator = getFromAccumulator

/**
 * @param {string} jsonPath
 * @param {Accumulator} acc
 * @returns {*}
 */
function getFromAccumulatorValue (jsonPath, acc) {
  return _.get(acc.value, jsonPath)
}

module.exports.getFromAccumulatorValue = getFromAccumulatorValue

/**
 * @param {string} jsonPath
 * @param {Accumulator} acc
 * @returns {*}
 */
function mapFromAccumulatorValue (jsonPath, acc) {
  if (Array.isArray(acc.value)) {
    return _.map(acc.value, jsonPath)
  }

  return undefined
}

module.exports.mapFromAccumulatorValue = mapFromAccumulatorValue

/**
 * @param {string} jsonPath
 * @param {boolean} asCollection
 * @returns {Function}
 */
function getPathReducerFunction (jsonPath, asCollection) {
  if (jsonPath === '.' || _.isEmpty(jsonPath)) {
    return getAccumulatorValue
  }

  if (jsonPath.startsWith('..')) {
    return getFromAccumulator.bind(null, jsonPath.slice(2))
  }

  if (asCollection) {
    return mapFromAccumulatorValue.bind(null, jsonPath)
  }

  return getFromAccumulatorValue.bind(null, jsonPath)
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
  reducer.name = (source.substr(1) || '.').replace(/\[]$/, '')
  reducer.body = getPathReducerFunction(reducer.name, reducer.asCollection)

  return Object.freeze(reducer)
}

module.exports.create = create
