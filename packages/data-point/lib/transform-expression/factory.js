'use strict'

const _ = require('lodash')
const reducerFactory = require('../reducer/factory')

/**
 * Describes the transform parts used to reduce a context
 * @class
 * @property {string} context - initial context that will be passed on to each
 *                             reducer
 * @property {Array} reducers - collection of reducers that will be applied
 *                              to the context.
 */
function TransformExpression () {
  this.context = undefined
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

  if (_.isArray(source)) {
    return parseFromArray(source)
  }

  throw new Error(
    `Transform ${source.toString()} is not valid type (Array|String|Function)`
  )
}
module.exports.parse = parse

/**
 * parses a raw transform
 * @param  {string} transformRaw raw value path to be parsed
 * @return {Transform}
 */
function create (source) {
  const tokens = parse(source)

  const transformBase = new TransformExpression()
  transformBase.reducers = tokens.map(reducerFactory.create)

  return Object.freeze(transformBase)
}

module.exports.create = create
