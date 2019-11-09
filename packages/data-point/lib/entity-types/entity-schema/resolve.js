const _ = require("lodash");
const Ajv = require("ajv");

async function validateContext(acc) {
  const ajv = new Ajv(acc.reducer.spec.options);
  const validate = ajv.compile(acc.reducer.spec.schema);

  const valid = await validate(acc.value);

  if (!valid) {
    const messages = _.map(validate.errors, "message");
    const messageListStr = messages.join("\n -");
    const error = new Error(`Errors Found:\n - ${messageListStr}`);
    error.name = "InvalidSchema";
    error.errors = validate.errors;
    throw error;
  }

  // no error, just return value
  return acc.value;
}

module.exports.validateContext = validateContext;

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
// eslint-disable-next-line no-unused-vars
function resolve(acc, resolveReducer) {
  return validateContext(acc);
}

module.exports.resolve = resolve;
