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

    return acc
  })
}

module.exports.validateContext = validateContext

function resolve (acc, resolveReducer) {
  const value = acc.reducer.spec.value

  return resolveReducer(acc, value).then(racc => {
    return validateContext(racc)
  })
}

module.exports.resolve = resolve
