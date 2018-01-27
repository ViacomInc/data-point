const Util = require('util')
const _ = require('lodash')
const utils = require('../utils')

// TODO is the error message working correctly for stack trace?
function errorMessage (value, expectedType) {
  const entityId = _.get(value, 'reducer.spec.id', 'value')
  return Util.format(
    '%s did not pass type check, type expected: %s but received: %s. The value received is: %s',
    entityId,
    expectedType,
    utils.typeOf(value),
    _.truncate(Util.inspect(value, { breakLength: Infinity }), {
      length: 30
    })
  )
}

function isString (value) {
  if (typeof value === 'string') return value
  throw new Error(errorMessage(value, 'string'))
}

function isNumber (value) {
  if (typeof value === 'number') return value
  throw new Error(errorMessage(value, 'number'))
}

function isBoolean (value) {
  if (typeof value === 'boolean') return value
  throw new Error(errorMessage(value, 'boolean'))
}

function isFunction (value) {
  if (typeof value === 'function') return value
  throw new Error(errorMessage(value, 'function'))
}

function isError (value) {
  if (value instanceof Error) return value
  throw new Error(errorMessage(value, 'function'))
}

function isArray (value) {
  if (Array.isArray(value)) return value
  throw new Error(errorMessage(value, 'Array'))
}

function isObject (value) {
  if (_.isPlainObject(value)) return value
  throw new Error(errorMessage(value, 'Object'))
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
