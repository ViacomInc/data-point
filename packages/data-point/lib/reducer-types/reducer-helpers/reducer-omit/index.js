const factory = require('./factory')
const resolve = require('./resolve').resolve
const type = require('./type')

module.exports = {
  create: factory.create,
  name: factory.name,
  resolve: resolve,
  type: type
}
