const defaultTo = require("lodash/defaultTo");

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
// eslint-disable-next-line no-unused-vars
function resolve(accumulator, resolveReducer) {
  return defaultTo(accumulator.value, {});
}

module.exports.resolve = resolve;
