/* eslint global-require: 0 */

const reducer = require('./factory')
const resolve = require('./resolve').resolve
const type = require('./type')

module.exports = {
  create: reducer.create,
  isType: reducer.isType,
  resolve: resolve,
  type: type
}
