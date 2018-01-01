'use strict'

const _ = require('lodash')
const reducerFactory = require('../reducer/factory')

/**
 * Describes the transform parts used to reduce a context
 * @class
 * @property {Array} reducers - collection of reducers that will be applied
 */
function TransformExpression () {
  this.reducers = []
  this.typeOf = 'TransformExpression'
}

module.exports.TransformExpression = TransformExpression

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
 * parses a raw transform
 * @param {string} source
 * @return {Transform}
 */
function create (source = []) {
  const tokens = parse(source)

  const transform = new TransformExpression()

  transform.reducers = tokens.map(token => {
    // NOTE: recursive call
    return reducerFactory.create(create, token)
  })

  return Object.freeze(transform)
}

module.exports.create = create
