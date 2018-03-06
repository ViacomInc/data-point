/* eslint global-require: 0 */

const core = require('./core')
const helpers = require('./helpers')

module.exports = {
  create: core.create,
  helpers: helpers.helpers,
  createEntity: helpers.createEntity,
  resolveEntity: helpers.resolveEntity,
  entityFactories: helpers.entityFactories,
  reducify: helpers.reducify,
  reducifyAll: helpers.reducifyAll,
  createReducer: helpers.createReducer,
  createReducerResolver: helpers.reducifyAll
}
