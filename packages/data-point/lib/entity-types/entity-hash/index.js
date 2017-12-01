/* eslint global-require: 0 */

const factory = require('./factory')
const reducer = require('./reducer')

module.exports = {
  create: factory.create,
  resolve: reducer.resolve
}
