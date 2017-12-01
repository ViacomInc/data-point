'use strict'

/* eslint no-underscore-dangle: ["error", { "allow": ["___done", "___resolve"] }] */

const _ = require('lodash')

function MiddlewareContext () {
  this.___done = false
  this.___resolve = false
}

MiddlewareContext.prototype.resolve = function resolve (value) {
  if (this.___resolve === true || this.___done === true) {
    throw new Error('can not execute resolve() more than once per stack chain.')
  }

  // only assign if argument passed regardless of the value
  if (arguments.length) {
    this.value = value
    this.___resolve = true
  }

  this.___done = true
}

module.exports.MiddlewareContext = MiddlewareContext

function create (spec) {
  const middlewareContext = new MiddlewareContext()
  const middlewareContextExtended = _.assignIn(middlewareContext, spec)
  return middlewareContextExtended
}

module.exports.create = create
