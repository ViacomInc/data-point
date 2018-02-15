const typeCheckFunctions = require('./type-check-function-reducers')

const modifiers = {
  string: typeCheckFunctions.isString,
  number: typeCheckFunctions.isNumber,
  boolean: typeCheckFunctions.isBoolean,
  function: typeCheckFunctions.isFunction,
  error: typeCheckFunctions.isError,
  array: typeCheckFunctions.isArray,
  object: typeCheckFunctions.isObject
}

/**
 * @param {*} source
 * @return {*}
 */
function normalizeTypeCheckSource (source) {
  if (Array.isArray(source)) {
    return source.map(r => normalizeTypeCheckSource(r))
  }

  return modifiers[source] || source
}

module.exports.normalizeTypeCheckSource = normalizeTypeCheckSource

/**
 * @param {string} defaultType
 * @param {string} specType
 * @throws if specType !== defaultType but it's a key in the modifiers object
 * @return {string|Array<String>} TODO is this type correct?
 */
function getOutputTypeWithDefault (defaultType, specType) {
  if (!specType || specType === defaultType) {
    return defaultType
  }

  if (modifiers[specType]) {
    throw new Error()
  }

  return [defaultType, specType]
}

module.exports.getOutputTypeWithDefault = getOutputTypeWithDefault
