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

function EntityFactory (type, factory) {
  return function createEntity (name, spec) {
    let entityName = name
    let entitySpec = spec
    if (arguments.length === 1) {
      entityName = 'generic'
      entitySpec = name
    }
    const entity = factory(name, entitySpec)
    return create(type, entityName, entity)
  }
}

/**
 * @param {Function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 * @param {string} name - Entity's name
 */
function create (type, name, entity) {
  entity.entityType = type
  entity.isEntityInstance = true

  entity.name = name
  entity.id = `${entity.entityType}:${name}`

  entity.resolve = validateResolve(entity, entity.resolve)

  if (entity.before) {
    entity.before = createReducer(entity.before)
  }

  if (entity.value) {
    entity.value = createReducer(entity.value)
  }

  if (entity.after) {
    entity.after = createReducer(entity.after)
  }

  if (entity.error) {
    entity.error = createReducer(entity.error)
  }

  if (entity.inputType) {
    const inputType = normalizeTypeCheckSource(entity.inputType)
    entity.inputType = createReducer(inputType)
  }

  if (entity.outputType) {
    const outputType = normalizeTypeCheckSource(entity.outputType)
    entity.outputType = createReducer(outputType)
  }

  entity.params = deepFreeze(defaultTo(entity.params, {}))

  return Object.freeze(entity)
}

module.exports = {
  EntityFactory,
  validateResolve,
  create
}
