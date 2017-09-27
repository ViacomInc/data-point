'use strict'

/**
 * Enum for Parameter Types
 * @readonly
 * @enum {string}
 */
const ParameterType = {
  UNDEFINED: 'undefined',
  NULL: 'null',
  BOOLEAN: 'boolean',
  STRING: 'string',
  NUMBER: 'number',
  REDUCER: 'reducer',
  ERROR: 'error'
}

module.exports = Object.freeze(ParameterType)
