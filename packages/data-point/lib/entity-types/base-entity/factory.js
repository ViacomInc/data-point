const deepFreeze = require('deep-freeze')
const defaultTo = require('lodash/defaultTo')
const { normalizeTypeCheckSource } = require('../../helpers/type-check-helpers')

/**
 * @param {Function} createReducer
 * @param {Function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 * @param {string} id - Entity's id
 * @return {Entity}
 */
function create (createReducer, Factory, spec, id) {
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
