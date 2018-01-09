
const _ = require('lodash')

function Locals () {}

module.exports.Locals = Locals

/**
 * @param {Object} spec
 * @return {Locals}
 */
function create (spec) {
  const locals = new Locals()
  return _.assign(locals, spec)
}

module.exports.create = create
