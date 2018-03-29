/* eslint global-require: 0 */

const helpers = require('./helpers')

const utils = require('../utils')

module.exports = {
  helpers: helpers.helpers,
  isReducer: helpers.isReducer,
  createReducer: helpers.createReducer,
  createEntity: helpers.createEntity,
  resolveEntity: helpers.resolveEntity,
  validateEntityModifiers: helpers.validateEntityModifiers,
  reducify: helpers.reducify,
  reducifyAll: helpers.reducifyAll,
  mockReducer: helpers.mockReducer,
  createAccumulator: helpers.createAccumulator,
  createReducerResolver: helpers.createReducerResolver,
  set: utils.set,
  assign: utils.assign,
  getUID: utils.getUID,
  typeOf: utils.typeOf,
  inspect: utils.inspect,
  inspectProperties: utils.inspectProperties,
  isFalsy: utils.isFalsy
}
