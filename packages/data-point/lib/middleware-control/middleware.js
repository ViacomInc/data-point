const _ = require('lodash')
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

  function next (err) {
    if (err) {
      return done(err, accumulator)
    }

    if (accumulator.___done === true) {
      return done(null, accumulator)
    }

    const middlewareFunc = stack.shift()

    if (typeof middlewareFunc === 'undefined') {
      return done(null, accumulator)
    }

    const execError = _.attempt(middlewareFunc, accumulator, next)

    if (_.isError(execError)) {
      next(execError)
    }

    return true
  }

  return next()
}

module.exports.execute = Promise.promisify(run)
