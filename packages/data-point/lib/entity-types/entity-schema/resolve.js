const _ = require('lodash')
const Promise = require('bluebird')
const Ajv = require('ajv')

/**
 * @param {Accumulator} acc
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function validateContext (acc, stack) {
  const ajv = new Ajv(acc.reducer.spec.options)
  const validate = ajv.compile(acc.reducer.spec.schema)

  // TODO log stack
  return Promise.resolve(validate(acc.value)).then(valid => {
    if (!valid) {
      const messages = _.map(validate.errors, 'message')
      const messageListStr = messages.join('\n -')
      const error = new Error(`Errors Found:\n - ${messageListStr}`)
      error.name = 'InvalidSchema'
      error.errors = validate.errors
      return Promise.reject(error)
    }

    return acc
  })
}

module.exports.validateContext = validateContext

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (acc, resolveReducer, stack) {
  const value = acc.reducer.spec.value

  const _stack = stack ? [...stack, 'value'] : stack
  return resolveReducer(acc, value, _stack).then(racc => {
    return validateContext(racc, _stack)
  })
}

module.exports.resolve = resolve
