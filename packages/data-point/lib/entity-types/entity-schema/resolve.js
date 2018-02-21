const _ = require('lodash')
const Promise = require('bluebird')
const Ajv = require('ajv')

/**
 * @param {Accumulator} acc
 * @return {Promise}
 */
function validateContext (acc) {
  const ajv = new Ajv(acc.reducer.spec.options)
  const validate = ajv.compile(acc.reducer.spec.schema)
  if (validate(acc.value)) {
    return Promise.resolve(acc)
  }

  const message = _.map(validate.errors, 'message').join('\n -')
  const error = new Error(`Errors Found:\n - ${message}`)
  error.name = 'InvalidSchema'
  error.errors = validate.errors
  return Promise.reject(error)
}

module.exports.validateContext = validateContext

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @param {Promise}
 */
function resolve (acc, resolveReducer) {
  const value = acc.reducer.spec.value
  return resolveReducer(acc, value, [['value']]).then(racc => {
    return validateContext(racc).catch(error => {
      error._stack = ['ajv#validate']
      throw error
    })
  })
}

module.exports.resolve = resolve
