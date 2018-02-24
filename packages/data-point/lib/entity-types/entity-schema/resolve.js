const _ = require('lodash')
const Promise = require('bluebird')
const Ajv = require('ajv')

const createReducer = require('../../reducer-types').create

/**
 * @param {*} value
 * @param {Object} context
 * @return {Promise}
 */
function validateContext (value, context) {
  const ajv = new Ajv(context.reducer.spec.options)
  const validate = ajv.compile(context.reducer.spec.schema)
  if (validate(value)) {
    return Promise.resolve(value)
  }

  const message = _.map(validate.errors, 'message').join('\n -')
  const error = new Error(`Errors Found:\n - ${message}`)
  error.name = 'InvalidSchema'
  error.errors = validate.errors
  return Promise.reject(error)
}

module.exports.validateContext = validateContext

// this name will appear in the stack trace if schema validation fails
Object.defineProperty(validateContext, 'name', {
  value: 'ajv#validate'
})

// this function is a reducer so that we can generate
// reducer stack traces if the schema validation fails
const _validateContext = createReducer(validateContext)

module.exports._validateContext = _validateContext

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @param {Promise}
 */
function resolve (accumulator, resolveReducer) {
  const value = accumulator.reducer.spec.value
  return resolveReducer(accumulator, value, [['value']]).then(acc =>
    resolveReducer(acc, _validateContext)
  )
}

module.exports.resolve = resolve
