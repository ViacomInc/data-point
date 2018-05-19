const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')
const { normalizeTypeCheckSource } = require('../../helpers/type-check-helpers')

const createReducer = require('../../reducer-types').create

function validateResolve (entity, resolve) {
  if (typeof resolve !== 'function') {
    throw new Error(
      `Entity "${
        entity.id
      }" must be provided with a resolve(accumulator:Accumulator, resolveReducer:Function) function`
    )
  }

  if (resolve.length !== 2) {
    throw new Error(
      `Entity "${
        entity.id
      }" resolve(accumulator:Accumulator, resolveReducer:Function) function must have an arity of 2`
    )
  }

  return resolve
}

/**
 * @param {Function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 * @param {string} name - Entity's name
 */
function createEntityType (type, name, entity) {
  // delete entity.spec
  const spec = Object.assign({}, entity.spec, entity)
  entity.entityType = type
  entity.isEntityInstance = true

  entity.name = name
  entity.id = `${entity.entityType}:${name}`

  entity.resolve = validateResolve(entity, entity.resolve)

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

  return Object.freeze(entity)
}

function create (type, factory) {
  return function createEntity (name, spec) {
    let entityName = name
    let entitySpec = spec
    if (arguments.length === 1) {
      entityName = 'generic'
      entitySpec = name
    }
    const entity = factory(name, entitySpec)
    return createEntityType(type, entityName, entity)
  }
}

module.exports = {
  validateResolve,
  createEntityType,
  create
}
