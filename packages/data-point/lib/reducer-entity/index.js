/* eslint global-require: 0 */

const reducer = require('./factory')
const resolve = require('./resolve').resolve

module.exports = {
  create: reducer.create,
  type: reducer.type,
  isType: reducer.isEntity,
  resolve: resolve
}
