'use strict'

const _ = require('lodash')
const parameterParser = require('../parameter/parameter-expression')

const REDUCER_FUNCTION = (module.exports.type = 'ReducerFunction')

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {Array} parameters - collection of  @see {@link Parameter} items
 * @property {boolean} isFunction - true if reducer is already function
 * @property {Function} body - actual function body
 */
function ReducerFunction () {
  this.type = REDUCER_FUNCTION
  this.name = ''
  this.parameters = []
  this.isFunction = false
  this.body = undefined
}

module.exports.ReducerFunction = ReducerFunction

function isValidFunction (source) {
  return _.isFunction(source) || source.length === 2
}

module.exports.isValidFunction = isValidFunction

function isFunction (source) {
  return (
    isValidFunction(source) ||
    (_.isString(source) && source.match(/^(\w[\w.]*)\((.*)\)/) !== null)
  )
}

module.exports.isFunction = isFunction

function getFunctionName (source) {
  return source.match(/.+?(?=\()/)[0]
}

module.exports.getFunctionName = getFunctionName

function getParameters (source) {
  return source.match(/.*?\(([^)]*)\)/)[1]
}

module.exports.getParameters = getParameters

function splitParameters (source) {
  return source.split(',').map(_.trim)
}

module.exports.splitParameters = splitParameters

/**
 * Parse parameters from function source
 * @param {string} source function source
 * @returns
 */
function parseParameters (source) {
  const args = getParameters(source)
  let argsList = args.split(',').map(_.trim)

  argsList = _.compact(argsList)

  return argsList.map(parameterParser.parse)
}

module.exports.parseParameters = parseParameters

/**
 * parse reducer
 * @param  {string} reducerRaw raw reducer path
 * @return {reducer}
 */
function create (source) {
  const reducer = new ReducerFunction()

  if (_.isFunction(source)) {
    reducer.isFunction = true
    reducer.body = source
  } else {
    reducer.name = getFunctionName(source)
    reducer.parameters = parseParameters(source)
  }

  return Object.freeze(reducer)
}

module.exports.create = create
