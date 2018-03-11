/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 */
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec
  return resolveReducer(accumulator, entity.value, [['value']])
}

module.exports.resolve = resolve
