const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')
const { normalizeTypeCheckSource } = require('../../helpers/type-check-helpers')

const createReducer = require('../../reducer-types').create

/**
 * @throws When function is not valid
 * @param {Function} resolve
 * @returns {Boolean} true if valid
 */
function validateResolve (resolve) {
  if (typeof resolve !== 'function') {
    throw new Error(
      `"resolve" must be a function, create(type:String, factory:Function, resolve:Function)`
    )
  }

  if (resolve.length !== 2) {
    throw new Error(
      '"resolve" function must have an arity of 2, resolve(accumulator:Accumulator, resolveReducer:Function)'
    )
  }

  return true
}

/**
 * @throws When function is not valid
 * @param {Function} factory
 * @returns {Boolean} true if valid
 */
function validateFactory (factory) {
  if (typeof factory !== 'function') {
    throw new Error(
      '"factory" argument must be a function, create(type:String, factory:Function, resolve:Function)'
    )
  }
  if (factory.length !== 2) {
    throw new Error(
      '"factory" argument must be a function with arity of 2 factory(name:String, spec:Object)'
    )
  }
  return true
}

/**
 * NOTE: this method mutates target
 * @param {String} name reducer name
 * @param {Object} target entity target
 * @param {Object} spec entity source spec
 */
function setReducerIfTruthy (name, target, spec) {
  if (spec[name]) {
    target[name] = createReducer(spec[name])
  }
}

/**
 * @param {String} type Entity's type
 * @param {String} name Entity's name
 * @param {Object} entity Entity Object
 * @returns {Object} Entity instance
 */
function createEntityType (type, name, entity) {
  const spec = Object.assign({}, entity.spec, entity)

  entity.entityType = type
  entity.isEntityInstance = true

  entity.name = name
  entity.id = `${entity.entityType}:${name}`

  setReducerIfTruthy('before', entity, spec)
  setReducerIfTruthy('value', entity, spec)
  setReducerIfTruthy('after', entity, spec)
  setReducerIfTruthy('error', entity, spec)

  if (spec.inputType) {
    const inputType = normalizeTypeCheckSource(spec.inputType)
    entity.inputType = createReducer(inputType)
  }

  if (spec.outputType) {
    const outputType = normalizeTypeCheckSource(spec.outputType)
    entity.outputType = createReducer(outputType)
  }

  entity.params = defaultTo(spec.params, {})

  return createEntityInstance(entity)
}

/**
 * @param {Object} entity
 * @returns {Object} entity named instance
 */
function createEntityInstance (entity) {
  function EntityFactory () {}
  Object.defineProperty(EntityFactory, 'name', {
    value: entity.id
  })

  return deepFreeze(Object.assign(new EntityFactory(), entity))
}

/**
 * @param {String} type Entity's type
 * @param {Function} factory factory function to create the entity
 * @param {Function} resolve function to resolve the entity instance
 */
function create (type, factory, resolve) {
  if (arguments.length !== 3) {
    throw new Error(
      'Received wrong number of arguments. Try passing create(type:String, factory:Function, resolve:Function)'
    )
  }
  if (typeof type !== 'string') {
    throw new Error(
      '"type" argument must be a string create(type:String, factory:Function, resolve:Function)'
    )
  }

  validateFactory(factory)
  validateResolve(resolve)

  /**
   * @param {String} name - Entity's name
   * @param {Object} spec - spec for the Entity
   * @returns {Object} Entity instance
   */
  return function createEntity (name, spec) {
    let entityName = name
    let entitySpec = spec
    if (arguments.length === 1) {
      entityName = 'generic'
      entitySpec = name
    }
    const entity = factory(name, entitySpec)
    entity.resolve = resolve
    const e = createEntityType(type, entityName, entity)
    return e
  }
}

module.exports = {
  validateResolve,
  validateFactory,
  createEntityType,
  createEntityInstance,
  create
}
