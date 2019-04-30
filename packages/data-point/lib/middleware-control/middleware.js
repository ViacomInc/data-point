const once = require('lodash/once')
const attempt = require('lodash/attempt')
const isError = require('lodash/isError')
const Promise = require('bluebird')

/**
 *
 * @param {Accumulator} accumulator
 * @param {Array<Function>} stackSpec
 * @param {Function} done
 * @return {*}
 */
function run (accumulator, stackSpec, done) {
  if (!stackSpec || stackSpec.length === 0) {
    return done(null, accumulator)
  }

  const stack = stackSpec.slice(0)

  const onceDone = once(done)
  function next (err, value) {
    if (err) {
      return onceDone(err, accumulator)
    }

    if (arguments.length === 2) {
      accumulator.value = value
      accumulator.___resolve = true
      accumulator.___done = true
    }

    if (accumulator.___done === true) {
      return onceDone(null, accumulator)
    }

    const middlewareFunc = stack.shift()

    if (typeof middlewareFunc === 'undefined') {
      return onceDone(null, accumulator)
    }

    const execError = attempt(middlewareFunc, accumulator, next)

    if (isError(execError)) {
      next(execError)
    }

    return true
  }

  return next()
}

module.exports.execute = Promise.promisify(run)
