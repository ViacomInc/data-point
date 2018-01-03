'use strict'

const _ = require('lodash')

const REDUCER_LIST = 'ReducerList'

module.exports.type = REDUCER_LIST

/**
 * @class
 * @property {string} type
 * @property {Array<reducer>} reducers
 */
function ReducerList () {
  this.type = REDUCER_LIST
  this.reducers = []
}

module.exports.ReducerList = ReducerList

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
  const transformSource = _.defaultTo(source, '')
  const tokens = _.compact(transformSource.split(' | '))
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
 * @param {Function} createTransform
 * @param {Array} source
 * @return {Transform}
 */
function create (createTransform, source = []) {
  const tokens = parse(source)
  const reducers = tokens.map(token => createTransform(token))

  const transform = new ReducerList()
  transform.reducers = reducers

  return Object.freeze(transform)
}

module.exports.create = create
