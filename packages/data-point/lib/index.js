/* eslint global-require: 0 */

const core = require('./core')
const helpers = require('./helpers')
const { createTypeCheckReducer } = require('./helpers/type-check-functions')

module.exports = {
  create: core.create,
  helpers: helpers.helpers,
  createEntity: helpers.createEntity,
  resolveEntity: helpers.resolveEntity,
  reducify: helpers.reducify,
  reducifyAll: helpers.reducifyAll,
  createReducerResolver: helpers.reducifyAll,
  createTypeCheckReducer
}
