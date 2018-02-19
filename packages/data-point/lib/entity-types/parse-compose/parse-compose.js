const intersection = require('lodash/intersection')

/**
 * @param {string} entityId
 * @param {Array<string>} validKeys
 * @param {Object} spec
 * @throws if the spec is not valid
 * @returns {Array<Object>}
 */
function parse (entityId, validKeys, spec) {
  const specKeys = intersection(Object.keys(spec), validKeys)
  if (specKeys.length > 1) {
    throw new Error(
      `Entity ${entityId} is invalid. When using multiple keys, they should be inside compose.`
    )
  }

  if (spec.compose) {
    if (!Array.isArray(spec.compose)) {
      throw new Error(
        `Entity ${entityId} compose property is expected to be an instance of Array, but found ${
          spec.compose
        }`
      )
    }

    if (specKeys.length !== 0) {
      throw new Error(
        `Entity ${entityId} is invalid; when 'compose' is defined the keys: '${specKeys.join(
          ', '
        )}' should be inside compose.`
      )
    }

    return parseComposeSpec(entityId, validKeys, spec.compose)
  }

  if (specKeys.length === 1) {
    const key = specKeys[0]
    return [createComposeReducer(key, spec[key])]
  }

  return []
}

module.exports.parse = parse

/**
 * @param {string} entityId
 * @param {Array<string>} modifierKeys
 * @param {Array<Object>} composeSpec
 * @returns {Array<Object>}
 */
function parseComposeSpec (entityId, modifierKeys, composeSpec) {
  return composeSpec.map(modifierSpec => {
    return parseModifierSpec(entityId, modifierKeys, modifierSpec)
  })
}

module.exports.parseComposeSpec = parseComposeSpec

/**
 * @param {string} entityId
 * @param {Array<string>} validKeys
 * @param {Object} modifierSpec
 * @throws if the spec is not valid
 * @returns {Object}
 */
function parseModifierSpec (entityId, validKeys, modifierSpec) {
  const keys = Object.keys(modifierSpec)
  if (keys.length !== 1) {
    throw new Error(
      `Compose Modifiers may only contain one key, but found ${keys.length}${
        keys.length ? ` (${keys.join(', ')})` : ''
      }`
    )
  }

  const type = keys[0]
  if (!validKeys.includes(type)) {
    throw new Error(
      `Modifier '${type}' in ${entityId} doesn't match any of the valid Modifiers: ${validKeys}`
    )
  }

  return createComposeReducer(type, modifierSpec[type])
}

module.exports.parseModifierSpec = parseModifierSpec

/**
 * @param {string} type
 * @param {Object} spec
 * @returns {Object}
 */
function createComposeReducer (type, spec) {
  return { type, spec }
}

module.exports.createComposeReducer = createComposeReducer
