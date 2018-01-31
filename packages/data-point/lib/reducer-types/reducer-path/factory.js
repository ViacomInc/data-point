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
  if (jsonPath === '$') {
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
 * @param {Function} createReducer
 * @param {string} source - must begin with $
 * @return {reducer}
 */
function create (createReducer, source) {
  const reducer = new ReducerPath()
  const value = source.replace(/\[]$/, '')
  reducer.name = value.substr(1) || '$'
  reducer.asCollection = source.endsWith('[]')
  reducer.body = getPathReducerFunction(reducer.name, reducer.asCollection)
  Object.defineProperty(reducer.body, 'name', { value })

  return reducer
}

module.exports.create = create
