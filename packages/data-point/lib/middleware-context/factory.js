const _ = require('lodash')

/**
 * @class
 * @property {Boolean} ___done
 * @property {Boolean} ___resolve
 */
function MiddlewareContext () {
  this.___done = false
  this.___resolve = 0
}

/**
 * @param {Object} spec
 * @return {Object}
 */
function create (spec) {
  const middlewareContext = new MiddlewareContext()
  const middlewareContextExtended = _.assignIn(middlewareContext, spec)
  return middlewareContextExtended
}

module.exports.create = create
