const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')
const typeCheckFunctionReducers = require('../../helpers/type-check-function-reducers')

const createReducer = require('../../reducer-types').create

function acceptAnyType (acc) {
  return acc.value
}

module.exports.acceptAnyType = acceptAnyType

const validTypechecks = [
  'isString',
  'isNumber',
  'isBoolean',
  'isFunction',
  'isError',
  'isArray',
  'isObject'
]

function getTypeModifier (reducer) {
  if (typeof reducer === 'undefined') {
    return acceptAnyType
  }

  if (validTypechecks.includes(reducer)) {
    return typeCheckFunctionReducers[reducer]
  }

  return reducer
}

module.exports.getTypeModifier = getTypeModifier

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

  const inputType = getTypeModifier(spec.inputType)
  entity.inputType = createReducer(inputType)

  const outputType = getTypeModifier(spec.outputType)
  entity.outputType = createReducer(outputType)

  entity.params = deepFreeze(defaultTo(spec.params, {}))

  return entity
}

module.exports.create = create
