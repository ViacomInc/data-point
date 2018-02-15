const Util = require('util')
const _ = require('lodash')
const utils = require('../utils')

/**
 * @param {*} value
 * @param {string} expectedType
 * @return {string}
 */
function getErrorMessage (value, expectedType) {
  return Util.format(
    'Entity type check failed!\nExpected type: %s\nActual type: %s\nInput value: %s',
    expectedType,
    utils.typeOf(value),
    _.truncate(Util.inspect(value, { breakLength: Infinity }), {
      length: 30
    })
  )
}

function isString (value) {
  if (typeof value === 'string') return value
  throw new Error(getErrorMessage(value, 'string'))
}

function isNumber (value) {
  if (typeof value === 'number') return value
  throw new Error(getErrorMessage(value, 'number'))
}

function isBoolean (value) {
  if (typeof value === 'boolean') return value
  throw new Error(getErrorMessage(value, 'boolean'))
}

function isFunction (value) {
  if (typeof value === 'function') return value
  throw new Error(getErrorMessage(value, 'function'))
}

function isError (value) {
  if (value instanceof Error) return value
  throw new Error(getErrorMessage(value, 'function'))
}

function isArray (value) {
  if (Array.isArray(value)) return value
  throw new Error(getErrorMessage(value, 'array'))
}

function isObject (value) {
  if (_.isPlainObject(value)) return value
  throw new Error(getErrorMessage(value, 'object'))
}

module.exports = {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isError,
  isArray,
  isObject
}
