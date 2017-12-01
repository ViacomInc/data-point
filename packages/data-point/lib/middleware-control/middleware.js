'use strict'

/* eslint no-underscore-dangle: ["error", { "allow": ["___done"] }] */

const _ = require('lodash')
const Promise = require('bluebird')

function run (context, stackSpec, done) {
  if (stackSpec.length === 0) {
    return done(null, context)
  }

  const stack = stackSpec.slice(0)

  function next (err) {
    if (err) {
      return done(err, context)
    }

    if (context.___done === true) {
      return done(null, context)
    }

    const middlewareFunc = stack.shift()

    if (typeof middlewareFunc === 'undefined') {
      return done(null, context)
    }

    const execError = _.attempt(middlewareFunc, context, next)

    if (_.isError(execError)) {
      next(execError)
    }

    return true
  }

  return next()
}

module.exports.execute = Promise.promisify(run)
