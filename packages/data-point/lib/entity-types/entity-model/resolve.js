/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {*}
 */
function resolve (accumulator, resolveReducer) {
  return accumulator.value
}

module.exports.resolve = resolve
