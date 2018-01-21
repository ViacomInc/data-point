/* eslint global-require: 0 */

const core = require('./core')
const helpers = require('./helpers')

module.exports = {
  create: core.create,
  helpers: helpers.helpers,
  createEntity: helpers.createEntity,
  resolveEntity: helpers.resolveEntity,
  reducify: helpers.reducify,
  reducifyAll: helpers.reducifyAll,
  createReducerResolver: helpers.reducifyAll
  // createTransform: require('./reducer-types').create
}
