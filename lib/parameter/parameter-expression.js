'use strict'

const ParameterType = require('./parameter-type')

const numberTest = /^-?\d*[.]?\d+$/
const stringTest = /^"(.*)"$/
const reducerTest = /^\w+(\.\w+)*$/

/**
 * Defines a parameter
 * @typedef {Object} Parameter
 * @property {string} type - parameter type, value from ParameterType
 * @property {string} value - parsed value of the parameter
 */

/**
 * create a Parameter object
 * @param  {string} type  type of parameter
 * @param  {*} value parsed value of the parameter
 * @return {Parameter}
 */
function create (type, value) {
  return Object.freeze({
    type,
    value
  })
}

module.exports.create = create

/**
 * parse parameter value into a Parameter type.
 * @param  {string} value raw value of the parameter
 * @return {Parameter}       parsed Parameter
 */
function parse (value) {
  if (value === 'undefined') {
    return create(ParameterType.UNDEFINED, undefined)
  }

  if (value === 'null') {
    return create(ParameterType.NULL, null)
  }

  if (value === 'true') {
    return create(ParameterType.BOOLEAN, true)
  }

  if (value === 'false') {
    return create(ParameterType.BOOLEAN, false)
  }

  if (stringTest.test(value)) {
    return create(ParameterType.STRING, value.slice(1, -1))
  }

  if (numberTest.test(value)) {
    return create(ParameterType.NUMBER, parseFloat(value))
  }

  if (reducerTest.test(value)) {
    return create(ParameterType.REDUCER, value)
  }

  return create(
    ParameterType.ERROR,
    new Error(`unrecognized parameter:${value}`)
  )
}

module.exports.parse = parse
