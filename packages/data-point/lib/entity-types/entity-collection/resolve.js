/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec
  return resolveReducer(accumulator, entity.value).then(acc =>
    resolveReducer(acc, entity.compose)
  )
}

module.exports.resolve = resolve
