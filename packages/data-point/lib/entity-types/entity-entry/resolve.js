const _ = require('lodash')
const utils = require('../../utils')

function resolve (acc, resolveReducer) {
  const contextTransform = acc.reducer.spec.value
  let racc = acc
  racc = utils.set(acc, 'value', _.defaultTo(acc.value, {}))
  return resolveReducer(racc, contextTransform)
}

module.exports.resolve = resolve
