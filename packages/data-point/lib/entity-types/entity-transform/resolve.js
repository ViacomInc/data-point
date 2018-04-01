/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec
  return resolveReducer(accumulator, entity.value)
}

module.exports.resolve = resolve
