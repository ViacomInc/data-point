const Util = require('util')
const _ = require('lodash')
const utils = require('../utils')

function errorMessage (acc, expectedType) {
  const entityId = _.get(acc, 'reducer.spec.id', 'value')
  return Util.format(
    '%s did not pass type check, type expected: %s but recevied: %s. The value received is: %s',
    entityId,
    expectedType,
    utils.typeOf(acc.value),
    _.truncate(Util.inspect(acc.value, { breakLength: Infinity }), {
      length: 30
    })
  )
}

function isString (acc) {
  if (typeof acc.value === 'string') return acc.value
  throw new Error(errorMessage(acc, 'string'))
}

function isNumber (acc) {
  if (typeof acc.value === 'number') return acc.value
  throw new Error(errorMessage(acc, 'number'))
}

function isBoolean (acc) {
  if (typeof acc.value === 'boolean') return acc.value
  throw new Error(errorMessage(acc, 'boolean'))
}

function isFunction (acc) {
  if (typeof acc.value === 'function') return acc.value
  throw new Error(errorMessage(acc, 'function'))
}

function isError (acc) {
  if (acc.value instanceof Error) return acc.value
  throw new Error(errorMessage(acc, 'function'))
}

function isArray (acc) {
  if (Array.isArray(acc.value)) return acc.value
  throw new Error(errorMessage(acc, 'Array'))
}

function isObject (acc) {
  if (_.isPlainObject(acc.value)) return acc.value
  throw new Error(errorMessage(acc, 'Object'))
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
