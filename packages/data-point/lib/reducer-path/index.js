/* eslint global-require: 0 */

const reducer = require('./factory')

module.exports = {
  create: reducer.create,
  type: reducer.type,
  isType: reducer.isPath
}
