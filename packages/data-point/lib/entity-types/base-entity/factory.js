const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')
const { normalizeTypeCheckSource } = require('../../helpers/type-check-helpers')

const createReducer = require('../../reducer-types').create

function validateResolve (id, resolve) {
  if (typeof resolve !== 'function') {
    throw new Error(`Entity type "${id}" must provide a "resolve" function`)
  }

  if (resolve.length !== 2) {
    throw new Error(`Entity type "${id}.resolve" method must have an arity of 2 (accumulator:Accumulator, resolveReducer:Function)`)
  }

  return resolve
}

/**
 * @param {Function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 * @param {string} name - Entity's name
 */
function create (name, spec, resolve, Factory) {
  const entity = new Factory(spec)

  entity.isEntityInstance = true

  entity.name = name
  entity.id = `${entity.entityType}:${name}`

  entity.resolve = validateResolve(entity.id, resolve)

  if (spec.before) {
    entity.before = createReducer(spec.before)
  }

  if (spec.value) {
    entity.value = createReducer(spec.value)
  }

  if (spec.after) {
    entity.after = createReducer(spec.after)
  }

  if (spec.error) {
    entity.error = createReducer(spec.error)
  }

  if (spec.inputType) {
    const inputType = normalizeTypeCheckSource(spec.inputType)
    entity.inputType = createReducer(inputType)
  }

  if (spec.outputType) {
    const outputType = normalizeTypeCheckSource(spec.outputType)
    entity.outputType = createReducer(outputType)
  }

  entity.params = deepFreeze(defaultTo(spec.params, {}))

  return entity
}

module.exports.create = create
