/* eslint global-require: 0 */

const factory = require('./factory')
const resolve = require('./resolve').resolve

module.exports = {
  parse: factory.parse,
  create: factory.create,
  type: factory.type,
  isType: factory.isType,
  resolve: resolve
}
