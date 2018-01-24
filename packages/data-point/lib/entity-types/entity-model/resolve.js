/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 */
function resolve (accumulator, resolveReducer) {
  return resolveReducer(accumulator, accumulator.reducer.spec.value)
}

module.exports.resolve = resolve
