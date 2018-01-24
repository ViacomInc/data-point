const Util = require('util')
const _ = require('lodash')

function validateProperties (id, spec, validKeys) {
  const differentKeys = _.difference(Object.keys(spec), validKeys)
  if (differentKeys.length > 0) {
    throw new Error(
      Util.format(
        'Entity "%s" did not recognize the following properties: %s, valid properties are: %s.\nPlease review your entity and make any corrections so it can be parsed:\n\'%s\': %s',
        id,
        differentKeys.join(', '),
        validKeys.join(', '),
        id,
        Util.inspect(spec)
      )
    )
  }

  return true
}

module.exports.validateProperties = validateProperties

const baseModifiers = [
  'inputType',
  'before',
  'value',
  'after',
  'outputType',
  'error',
  'params'
]
function validateModifiers (id, spec, validKeys) {
  const modifierKeys = baseModifiers.concat(validKeys)
  return validateProperties(id, spec, modifierKeys)
}

module.exports.validateModifiers = validateModifiers