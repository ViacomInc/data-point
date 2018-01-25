const intersection = require('lodash/intersection')

/**
 * @param {string} id - Entity's Id
 * @param {Object} spec
 * @param {Array<string>} validKeys
 * @throws if the spec is not valid
 * @returns {boolean}
 */
function validateComposeModifiers (id, spec, validKeys) {
  if (!spec.compose) {
    return true
  }

  if (!(spec.compose instanceof Array)) {
    throw new Error(
      `Entity ${id} compose property is expected to be an instance of Array, but found ${
        spec.compose
      }`
    )
  }

  const specKeys = Object.keys(spec)
  const invalidKeys = intersection(validKeys, specKeys)
  if (invalidKeys.length !== 0) {
    throw new Error(
      `Entity ${id} is invalid; when 'compose' is defined the keys: '${invalidKeys.join(
        ', '
      )}' should be inside compose.`
    )
  }

  return true
}

module.exports.validateComposeModifiers = validateComposeModifiers

/**
 * @param {string} entityId
 * @param {Array<Object>} compose
 * @param {Array<string>} validKeys
 * @throws if compose contains an invalid modifier type
 * @returns {boolean}
 */
function validateCompose (entityId, compose, validKeys) {
  compose.forEach(modifier => {
    if (validKeys.indexOf(modifier.type) === -1) {
      throw new Error(
        `Modifier '${
          modifier.type
        }' in ${entityId} doesn't match any of the registered Modifiers: ${validKeys}`
      )
    }
  })

  return true
}

module.exports.validateCompose = validateCompose

/**
 * @param {string} type
 * @param {Object} spec
 * @returns {Object}
 */
function createComposeReducer (type, spec) {
  return {
    type,
    spec
  }
}

module.exports.createComposeReducer = createComposeReducer

/**
 * @param {Object} modifierSpec
 * @throws if the spec does not contain exactly one key
 * @returns {Object}
 */
function parseModifierSpec (modifierSpec) {
  const keys = Object.keys(modifierSpec)
  if (keys.length !== 1) {
    throw new Error(
      `Compose Modifiers may only contain one key, but found ${keys.length}${
        keys.length ? ` (${keys.join(', ')})` : ''
      }`
    )
  }

  const type = keys[0]
  return createComposeReducer(keys[0], modifierSpec[type])
}

module.exports.parseModifierSpec = parseModifierSpec

/**
 * @param {Array<Object>} composeSpec
 * @returns {Array<Object>}
 */
function parseComposeSpecProperty (composeSpec) {
  return composeSpec.map(parseModifierSpec)
}

module.exports.parseComposeSpecProperty = parseComposeSpecProperty

/**
 * @param {Object} entitySpec
 * @param {Array<string>} modifierKeys
 * @returns {Array<Object>}
 */
function parseComposeFromEntitySpec (entitySpec, modifierKeys) {
  return modifierKeys.reduce((acc, modifierKey) => {
    const modifierSpec = entitySpec[modifierKey]
    if (modifierSpec) {
      const modifier = createComposeReducer(modifierKey, modifierSpec)
      acc.push(modifier)
    }

    return acc
  }, [])
}

module.exports.parseComposeFromEntitySpec = parseComposeFromEntitySpec

/**
 * @param {Object} entitySpec
 * @param {Array<string>} modifierKeys
 * @returns {Array<Object>}
 */
function parse (entitySpec, modifierKeys) {
  return entitySpec.compose
    ? parseComposeSpecProperty(entitySpec.compose, modifierKeys)
    : parseComposeFromEntitySpec(entitySpec, modifierKeys)
}

module.exports.parse = parse
