const Ajv = require('ajv')
const _ = require('lodash')
const deepFreeze = require('deep-freeze')

const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntitySchema () {
  this.schema = undefined
  this.options = {}
}

module.exports.EntitySchema = EntitySchema

/**
 * @param {Object} schema
 * @param {Object} options
 * @throws if schema is not a valid ajv schema
 * @return {boolean}
 */
function validateSchema (schema, options) {
  const ajv = new Ajv(options)
  ajv.validateSchema(schema)
  if (ajv.errors) {
    const msg = `Schema validation failed with the following errors:\n${JSON.stringify(
      ajv.errors,
      null,
      2
    )}`
    throw new Error(msg)
  }

  return true
}

module.exports.validateSchema = validateSchema

/**
 * Creates new Entity Object
 * @param {Object} spec - spec
 * @param {string} id - Entity id
 * @throws if spec.schema is not a valid ajv schema
 * @return {EntitySchema} Entity Object
 */
function create (spec, id) {
  const entity = createBaseEntity(EntitySchema, spec, id)
  entity.schema = deepFreeze(_.defaultTo(spec.schema, {}))
  entity.options = deepFreeze(_.defaultTo(spec.options, {}))
  validateSchema(entity.schema, entity.options)

  return Object.freeze(entity)
}

module.exports.create = create
