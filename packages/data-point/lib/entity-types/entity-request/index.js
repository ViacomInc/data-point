/* eslint global-require: 0 */

const factory = require('./factory')
const resolve = require('./resolve').resolve

module.exports = {
  create: factory.create,
  resolve: resolve
}
