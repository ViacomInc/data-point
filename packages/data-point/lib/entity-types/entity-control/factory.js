const _ = require('lodash')

const createBaseEntity = require('../base-entity').create
const { validateModifiers } = require('../validate-modifiers')

/**
 * @class
 */
function EntityControl () {
  this.select = undefined
}

module.exports.EntityControl = EntityControl

/**
 * map each key from spec into a reducer
 * @param {Function} createReducer
 * @param {Object} spec - each value will be mapped into a reducer
 * @return {Object}
 */
function parseCaseStatement (createReducer, spec) {
  return _.mapValues(spec, createReducer)
}

module.exports.parseCaseStatement = parseCaseStatement

/**
 * Parse only case statements
 * @param {Function} createReducer
 * @param {Array<Object>} spec
 * @return {Array<Object>}
 */
function parseCaseStatements (createReducer, spec) {
  return _(spec)
    .remove(statement => !_.isUndefined(statement.case))
    .map(statement => parseCaseStatement(createReducer, statement))
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
 * @param {Function} createReducer
 * @param {Object} spec
 * @return {Object}
 */
function parseSwitch (createReducer, spec) {
  const select = spec.select
  const defaultStatement = parseDefaultStatement(spec.id, select)
  return {
    cases: parseCaseStatements(createReducer, select),
    default: createReducer(defaultStatement)
  }
}

module.exports.parseSwitch = parseSwitch

/**
 * Creates new Entity Object
 * @param {Function} createReducer
 * @param {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityControl} Entity Object
 */
function create (createReducer, spec, id) {
  validateModifiers(id, spec, ['select'])
  const entity = createBaseEntity(createReducer, EntityControl, spec, id)
  entity.select = parseSwitch(createReducer, spec)
  return Object.freeze(entity)
}

module.exports.create = create
