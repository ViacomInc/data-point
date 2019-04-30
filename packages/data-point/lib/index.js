/* eslint global-require: 0 */

const util = require('util')

const core = require('./core')
const helpers = require('./helpers')
const entityTypes = require('./entity-types').definitions
const { createTypeCheckReducer } = require('./helpers/type-check-functions')

const deprecatedEntitiesTypesAccess = util.deprecate(
  () => entityTypes,
  'DataPoint.entities is being deprecated, please access entity factories directly from DataPoint. (e.g. DataPoint.Model'
)
const deprecatedHelpersAccess = util.deprecate(
  () => helpers.helpers,
  'DataPoint.helpers is being deprecated, please access helper methods directly from DataPoint. (e.g. DataPoint.map'
)

module.exports = {
  get entities () {
    return deprecatedEntitiesTypesAccess()
  },
  get helpers () {
    return deprecatedHelpersAccess()
  },
  ...entityTypes,
  ...helpers.helpers,
  create: core.create,
  createEntity: helpers.createEntity,
  resolveEntity: helpers.resolveEntity,
  entityFactories: helpers.entityFactories,
  reducify: helpers.reducify,
  reducifyAll: helpers.reducifyAll,
  createReducer: helpers.createReducer,
  createReducerResolver: helpers.reducifyAll,
  createTypeCheckReducer
}
