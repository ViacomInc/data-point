/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @return {Promise<Accumulator>}
 */
function resolve (accumulator, resolveReducer, stack) {
  const _stack = stack ? [...stack, ['value']] : stack
  return resolveReducer(accumulator, accumulator.reducer.spec.value, _stack)
}

module.exports.resolve = resolve
