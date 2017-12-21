'use strict'

const _ = require('lodash')

const createTransform = require('../../transform-expression').create
const helpers = require('../../helpers')

/**
 * EntityControl Constructor
 * @class
 */
function EntityControl () {
  this.select = undefined
}

module.exports.EntityControl = EntityControl

/**
 * map each key from spec into a Transform object
 *
 * @param {hash} spec - key/value where each value will be mapped into a Transform
 * @returns
 */
function parseCaseStatement (spec) {
  return _.mapValues(spec, createTransform)
}
module.exports.parseCaseStatement = parseCaseStatement

/**
 * Parse only case statements
 *
 * @param {hash} spec - key/value where each value will be mapped into a Transform
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
      `It seems ${
        id
      } is missing its default case, All entities must have their default case handled.`
    )
  }
  return defaultCase.default
}
/**
 * parse spec into transform strucure
 *
 * @param {any} spec
 * @returns
 */
function parseSwitch (spec) {
  const select = spec.select
  const defaultStatement = parseDefaultStatement(spec.id, select)
  return {
    cases: parseCaseStatements(select),
    default: createTransform(defaultStatement)
  }
}
module.exports.parseSwitch = parseSwitch

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityControl} Entity Object
 */
function create (spec, id) {
  const entity = helpers.createEntity(EntityControl, spec, id)
  entity.select = parseSwitch(spec)
  return Object.freeze(entity)
}

module.exports.create = create
