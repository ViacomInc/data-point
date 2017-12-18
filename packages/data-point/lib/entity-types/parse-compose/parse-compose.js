'use strict'

function createComposeReducer (type, spec) {
  return {
    type,
    spec
  }
}

module.exports.createComposeReducer = createComposeReducer

function parseModifierSpec (modifierSpec) {
  const keys = Object.keys(modifierSpec)
  if (keys.length !== 1) {
    throw new Error(
      `Compose Modifiers may only contain one key, found: ${
        keys.length
      }(${keys.join(', ')})`
    )
  }
  const type = keys[0]
  return createComposeReducer(keys[0], modifierSpec[type])
}

module.exports.parseModifierSpec = parseModifierSpec

function parseComposeSpecProperty (composeSpec) {
  return composeSpec.map(parseModifierSpec)
}

module.exports.parseComposeSpecProperty = parseComposeSpecProperty

function parseComposeFromEntitySpec (entitySpec, modifierKeys) {
  return modifierKeys.reduce((acc, modifierKey) => {
    if (typeof entitySpec[modifierKey] === 'undefined') {
      return acc
    }
    const modifier = createComposeReducer(modifierKey, entitySpec[modifierKey])
    acc.push(modifier)
    return acc
  }, [])
}

module.exports.parseComposeFromEntitySpec = parseComposeFromEntitySpec

function parse (spec, modifierKeys) {
  return spec.compose
    ? parseComposeSpecProperty(spec.compose)
    : parseComposeFromEntitySpec(spec, modifierKeys)
}

module.exports.parse = parse
