const Util = require('util')
const _ = require('lodash')
const stringify = require('json-stringify-safe')

/**
 * @throws Errors when it finds an invalid key
 * @param {string} id - entity id
 * @param {Object} spec - entity spec
 * @param {Array<string>} validKeys - keys to check against
 * @returns {Boolean} true if no errors
 */
function validateProperties (id, spec, validKeys) {
  const differentKeys = _.difference(Object.keys(spec), validKeys)
  if (differentKeys.length > 0) {
    throw new Error(
      Util.format(
        'Entity "%s" did not recognize the following properties:\n %s\nValid properties for this entity are:\n %s\nPlease review your entity and make any necessary corrections so it can be parsed:\n\'%s\': %s',
        id,
        differentKeys.join(', '),
        validKeys.join(', '),
        id,
        stringify(spec, null, 2)
      )
    )
  }

  return true
}

module.exports.validateProperties = validateProperties

/**
 * List of base modifiers that are accepted across all Entities
 * @type Array
 */
const baseModifiers = [
  'inputType',
  'before',
  'value',
  'after',
  'outputType',
  'error',
  'params'
]

/**
 * @throws Errors when it finds an invalid key
 * @param {string} id - entity id
 * @param {Object} spec - entity spec
 * @param {Array<string>} validKeys - keys to check against
 * @returns {Boolean} true if no errors
 */
function validateModifiers (id, spec, validKeys) {
  const modifierKeys = baseModifiers.concat(validKeys)
  return validateProperties(id, spec, modifierKeys)
}

module.exports.validateModifiers = validateModifiers
