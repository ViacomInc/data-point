const { isFalsy } = require('../utils')

/**
 * @param {Accumulator} accumulator
 * @param {*} _default
 * @returns {Accumulator}
 */
function resolve (value, _default) {
  if (isFalsy(value)) {
    return typeof _default === 'function' ? _default() : _default
  }

  return value
}

module.exports.resolve = resolve
