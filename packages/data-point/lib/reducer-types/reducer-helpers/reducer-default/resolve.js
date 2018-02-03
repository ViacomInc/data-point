const utils = require('../../../utils')
const { reducerOutputIsFalsy } = require('../utils')

/**
 * @param {Accumulator} accumulator
 * @param {*} _default
 * @returns {Accumulator}
 */
function resolve (accumulator, _default) {
  let value = accumulator.value
  if (reducerOutputIsFalsy(value)) {
    value = typeof _default === 'function' ? _default() : _default
  }

  return utils.assign(accumulator, { value })
}

module.exports.resolve = resolve
