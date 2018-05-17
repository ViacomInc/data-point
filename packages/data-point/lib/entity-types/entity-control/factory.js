const _ = require('lodash')
const { resolve } = require('./resolve')
const createReducer = require('../../reducer-types').create
const createBaseEntity = require('../base-entity').create
const { validateModifiers } = require('../validate-modifiers')

/**
 * @class
 */
function EntityControl () {
  this.entityType = 'control'
  this.select = undefined
}

module.exports.EntityControl = EntityControl

/**
 * map each key from spec into a reducer
 *
 * @param {hash} spec - key/value where each value will be mapped into a reducer
 * @returns
 */
function parseCaseStatement (spec) {
  return _.mapValues(spec, createReducer)
}
module.exports.parseCaseStatement = parseCaseStatement

/**
 * Parse only case statements
 *
 * @param {hash} spec - key/value where each value will be mapped into a reducer
 * @returns
 */
function parseCaseStatements (spec) {
  return _(spec)
    .remove(statement => !_.isUndefined(statement.case))
    .map(parseCaseStatement)
    .value()
}
module.exports.parseCaseStatements = parseCaseStatements

function parseDefaultStatement (id, select) {
  const defaultCase = select.find(statement => {
    return statement.default
  })
  if (!defaultCase) {
    throw new Error(
      `It seems ${id} is missing its default case, Control entities must have their default case handled.`
    )
  }
  return defaultCase.default
}
/**
 * parse spec
 *
 * @param {any} spec
 * @returns
 */
function parseSwitch (spec) {
  const select = spec.select
  const defaultStatement = parseDefaultStatement(spec.id, select)
  return {
    cases: parseCaseStatements(select),
    default: createReducer(defaultStatement)
  }
}
module.exports.parseSwitch = parseSwitch

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityControl} Entity Object
 */
function create (id, spec) {
  validateModifiers(id, spec, ['select'])
  const entity = createBaseEntity(id, spec, resolve, EntityControl)
  entity.select = parseSwitch(spec)

  return Object.freeze(entity)
}

module.exports.create = create
