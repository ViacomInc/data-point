const _ = require('lodash')
const Promise = require('bluebird')
const Ajv = require('ajv')

function validateContext (acc) {
  const ajv = new Ajv(acc.reducer.spec.options)
  const validate = ajv.compile(acc.reducer.spec.schema)

  return Promise.resolve(validate(acc.value)).then(valid => {
    if (!valid) {
      const messages = _.map(validate.errors, 'message')
      const messageListStr = messages.join('\n -')
      const error = new Error(`Errors Found:\n - ${messageListStr}`)
      error.name = 'InvalidSchema'
      error.errors = validate.errors
      return Promise.reject(error)
    }

    // no error, just return value
    return acc.value
  })
}

module.exports.validateContext = validateContext

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (acc, resolveReducer) {
  return validateContext(acc)
}

module.exports.resolve = resolve
