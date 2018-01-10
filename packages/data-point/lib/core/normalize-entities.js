const _ = require('lodash')

function getParentSpec (spec, specs) {
  const parentId = spec.parentId
  if (typeof parentId === 'undefined') {
    return false
  }
  const parentSpec = specs[parentId]
  if (!parentSpec) {
    throw new Error(
      `Could not extend ${spec.id}, parent ${parentId} does not exist.`
    )
  }
  return parentSpec
}

module.exports.getParentSpec = getParentSpec

function getAncestors (spec, specs) {
  const ancestors = []
  let parent = getParentSpec(spec, specs)
  while (parent) {
    if (parent.id === spec.id || ancestors.indexOf(parent.id) >= 0) {
      throw new Error(
        `Could not extend ${
          spec.id
        }, parent chain creates a circle reference with ${parent.id}`
      )
    }
    ancestors.push(parent.id)
    parent = getParentSpec(parent, specs)
  }
  return ancestors
}

module.exports.getAncestors = getAncestors

function extendSpec (spec, ancestors, sources) {
  if (ancestors.length === 0) {
    return spec
  }
  const ancestorSpecs = ancestors.map(parentId => {
    return sources[parentId].spec
  })
  ancestorSpecs.reverse()
  return _.assign.apply(null, [{}].concat(ancestorSpecs, spec))
}

module.exports.extendSpec = extendSpec

function normalizeSpec (specItemId, source) {
  const tokens = specItemId.split(' -> ')
  const id = tokens[0]
  const parentId = tokens[1]
  return {
    id: id,
    parentId: parentId,
    spec: source[specItemId],
    ancestors: []
  }
}

module.exports.normalizeSpec = normalizeSpec

function normalizeEntitySpecs (source) {
  const specIds = Object.keys(source)
  return specIds.reduce((normSpecs, specItemId) => {
    const normalizedSpec = normalizeSpec(specItemId, source)
    normSpecs[normalizedSpec.id] = normalizedSpec
    return normSpecs
  }, {})
}

module.exports.normalizeEntitySpecs = normalizeEntitySpecs

function extendSpecItem (specItem, normalizedSpecs) {
  const ancestors = getAncestors(specItem, normalizedSpecs)
  const spec = extendSpec(specItem.spec, ancestors, normalizedSpecs)
  return _.assign({}, specItem, {
    ancestors,
    spec
  })
}

module.exports.extendSpecItem = extendSpecItem

function extendSpecs (normalizedSpecs) {
  return _.mapValues(normalizedSpecs, specItem => {
    return extendSpecItem(specItem, normalizedSpecs)
  })
}

module.exports.extendSpecs = extendSpecs

function normalize (source) {
  const normalizedSpecs = normalizeEntitySpecs(source)
  const finalSpecs = extendSpecs(normalizedSpecs)
  return finalSpecs
}

module.exports.normalize = normalize
