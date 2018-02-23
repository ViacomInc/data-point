const _ = require('lodash')

const REDUCER_LIST = 'ReducerList'

module.exports.type = REDUCER_LIST

/**
 * @class
 * @property {string} type
 * @property {Array<reducer>} reducers
 * @property {boolean} isEmpty
 */
function ReducerList () {
  this.type = 'ReducerList'
  this.reducers = []
}

module.exports.Constructor = ReducerList

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType (source) {
  return Array.isArray(source)
}

module.exports.isType = isType

/**
 * @param {string} source
 * @returns {Array}
 */
function parseFromString (source) {
  const reducerSource = _.defaultTo(source, '').trim()
  const tokens = _.compact(reducerSource.split(/\s+\|\s+/))
  return tokens
}

module.exports.parseFromString = parseFromString

/**
 * @param {*} source
 * @returns {*}
 */
function parseTokenExpression (source) {
  return _.isString(source) ? parseFromString(source) : source
}

module.exports.parseTokenExpression = parseTokenExpression

/**
 * @param {Array} source
 * @returns {Array}
 */
function parseFromArray (source) {
  return _.chain(source)
    .compact()
    .map(parseTokenExpression)
    .flatten()
    .value()
}

module.exports.parseFromArray = parseFromArray

/**
 * @param {*} source
 * @returns {Array}
 */
function parse (source) {
  return parseFromArray(source ? _.castArray(source) : [])
}

module.exports.parse = parse

/**
 * @param {Function} createReducer
 * @param {Array} source
 * @return {reducer}
 */
function create (createReducer, source) {
  const tokens = parse(source)
  const reducers = tokens.map(token => createReducer(token))

  const reducer = new ReducerList()
  reducer.reducers = reducers

  return reducer
}

module.exports.create = create
