const _ = require('lodash')
const utils = require('../../utils')

function resolve (acc, resolveReducer) {
  return utils.set(acc, 'value', _.defaultTo(acc.value, {}))
}

module.exports.resolve = resolve
