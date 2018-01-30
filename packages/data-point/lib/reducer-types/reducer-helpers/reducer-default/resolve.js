const isNil = require('lodash/isNil')

const utils = require('../../../utils')

/**
 * @param {Accumulator} accumulator
 * @param {*} _default
 * @returns {Promise<Accumulator>}
 */
function resolve (accumulator, _default) {
  let value = accumulator.value
  if (Number.isNaN(value) || isNil(value) || value === '') {
    value = typeof _default === 'function' ? _default() : _default
  }

  return utils.assign(accumulator, { value })
}

module.exports.resolve = resolve
