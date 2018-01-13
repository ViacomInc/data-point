/* eslint global-require: 0 */

const factory = require('./factory')
const resolve = require('./resolve').resolve
const type = require('./type')

module.exports = {
  parse: factory.parse,
  create: factory.create,
  isType: factory.isType,
  resolve: resolve,
  type: type
}
