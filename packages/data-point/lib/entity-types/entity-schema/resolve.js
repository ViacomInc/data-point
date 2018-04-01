const _ = require('lodash')
const Ajv = require('ajv')

const utils = require('../../utils')

/**
 * @param {Accumulator} accumulator
 * @throws if accumulator.value fails the schema validation
 * @return {boolean}
 */
function validateContext (accumulator) {
  const ajv = new Ajv(accumulator.reducer.spec.options)
  const validate = ajv.compile(accumulator.reducer.spec.schema)
  if (validate(accumulator.value)) {
    return true
  }

  const messages = _.map(validate.errors, 'message').join('\n -')
  const error = new Error(`Errors Found:\n - ${messages}`)
  error.name = 'InvalidSchema'
  error.errors = validate.errors
  throw error
}

module.exports.validateContext = validateContext

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (accumulator, resolveReducer) {
  const value = accumulator.reducer.spec.value
  return resolveReducer(accumulator, value).then(value => {
    validateContext(utils.set(accumulator, 'value', value))
    return value
  })
}

module.exports.resolve = resolve
