/* eslint global-require: 0 */

const core = require('./core')
const helpers = require('./helpers')
const entities = require('./entity-types').definitions
const { createTypeCheckReducer } = require('./helpers/type-check-functions')

module.exports = {
  entities,
  create: core.create,
  helpers: helpers.helpers,
  createEntity: helpers.createEntity,
  resolveEntity: helpers.resolveEntity,
  entityFactories: helpers.entityFactories,
  reducify: helpers.reducify,
  reducifyAll: helpers.reducifyAll,
  createReducer: helpers.createReducer,
  createReducerResolver: helpers.reducifyAll,
  createTypeCheckReducer
}
