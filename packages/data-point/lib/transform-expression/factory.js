'use strict'

const _ = require('lodash')
const util = require('util')
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

function parseFromString (source) {
  const transformSource = _.defaultTo(source, '')
  const tokens = _.compact(transformSource.split(' | '))
  return tokens
}
module.exports.parseFromString = parseFromString

function parseTokenExpression (source) {
  return _.isString(source) ? parseFromString(source) : source
}
module.exports.parseTokenExpression = parseTokenExpression

function parseFromArray (source) {
  return _.chain(source)
    .compact()
    .map(parseTokenExpression)
    .flatten()
    .value()
}
module.exports.parseFromArray = parseFromArray

function parse (src) {
  let source = _.defaultTo(src, [])

  if (_.isString(src) || _.isFunction(src)) {
    source = [src]
  }

  return parseFromArray(source)
}

module.exports.parse = parse

function isValid (source) {
  const type = typeof source
  return type === 'string' || type === 'function' || source instanceof Array
}

module.exports.isValid = isValid

function validate (source) {
  const isValidTransform = isValid(source)
  if (isValidTransform) {
    return true
  }
  const message = [
    `Could not parse a TransformExpression. The TransformExpression:\n `,
    _.attempt(util.inspect, source),
    '\nis not using a valid type, try using an Array, String or a Function.',
    '\nMore info: https://github.com/ViacomInc/data-point/tree/master/packages/data-point#transform-expression\n'
  ].join('')
  throw new Error(message)
}

module.exports.validate = validate

/**
 * parses a raw transform
 * @param  {string} transformRaw raw value path to be parsed
 * @return {Transform}
 */
function create (source = []) {
  validate(source)
  const tokens = parse(source)

  const transformBase = new TransformExpression()
  transformBase.reducers = tokens.map(reducerFactory.create)

  return Object.freeze(transformBase)
}

module.exports.create = create
