const Util = require('util')
const _ = require('lodash')

const utils = require('../utils')

/**
 * @param {string} expectedType
 * @param {*} value
 * @return {string}
 */
function reducerTypeError (expectedType, value) {
  const error = new Error()
  error._message = Util.format(
    'Type check failed: expected "%s" but received "%s"',
    expectedType,
    utils.typeOf(value)
  )

  return error
}

/**
 * @param {*} value
 * @throws
 */
function isString (value) {
  if (typeof value === 'string') return value
  throw reducerTypeError('string', value)
}

/**
 * @param {*} value
 * @throws
 */
function isNumber (value) {
  if (typeof value === 'number') return value
  throw reducerTypeError('number', value)
}

/**
 * @param {*} value
 * @throws
 */
function isBoolean (value) {
  if (typeof value === 'boolean') return value
  throw reducerTypeError('boolean', value)
}

/**
 * @param {*} value
 * @throws
 */
function isFunction (value) {
  if (typeof value === 'function') return value
  throw reducerTypeError('function', value)
}

/**
 * @param {*} value
 * @throws
 */
function isError (value) {
  if (value instanceof Error) return value
  throw reducerTypeError('error', value)
}

/**
 * @param {*} value
 * @throws
 */
function isArray (value) {
  if (Array.isArray(value)) return value
  throw reducerTypeError('Array', value)
}

/**
 * @param {*} value
 * @throws
 */
function isObject (value) {
  if (_.isPlainObject(value)) return value
  throw reducerTypeError('Object', value)
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
