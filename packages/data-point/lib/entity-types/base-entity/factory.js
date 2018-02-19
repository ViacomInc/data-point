const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')
const typeCheckFunctionReducers = require('../../helpers/type-check-function-reducers')

const createReducer = require('../../reducer-types').create

const typeCheckModifiers = {
  string: typeCheckFunctionReducers.isString,
  number: typeCheckFunctionReducers.isNumber,
  boolean: typeCheckFunctionReducers.isBoolean,
  function: typeCheckFunctionReducers.isFunction,
  error: typeCheckFunctionReducers.isError,
  array: typeCheckFunctionReducers.isArray,
  object: typeCheckFunctionReducers.isObject
}

/**
 * @param {*} source
 * @return {*}
 */
function normalizeTypeCheckSource (source) {
  if (Array.isArray(source)) {
    return source.map(r => normalizeTypeCheckSource(r))
  }

  return typeCheckModifiers[source] || source
}

module.exports.normalizeTypeCheckSource = normalizeTypeCheckSource

/**
 * @param {Function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 * @param {string} id - Entity's id
 */
function create (Factory, spec, id) {
  const entity = new Factory(spec)

  entity.id = id

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
