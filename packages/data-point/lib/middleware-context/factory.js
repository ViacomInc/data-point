const _ = require('lodash')

/**
 * @class
 * @property {Boolean} ___done
 * @property {Boolean} ___resolve
 */
function MiddlewareContext () {
  this.___done = false
  this.___resolve = false
}

/**
 * @param {*} value
 * @throws if it's been called more than once
 */
MiddlewareContext.prototype.resolve = function resolve (value) {
  if (this.___resolve === true || this.___done === true) {
    throw new Error('can not execute resolve() more than once per stack chain.')
  }

  // only assign if an argument is passed, regardless of the value
  if (arguments.length) {
    this.value = value
    this.___resolve = true
  }

  this.___done = true
}

module.exports.MiddlewareContext = MiddlewareContext

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
