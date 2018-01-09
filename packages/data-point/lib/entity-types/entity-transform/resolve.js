
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec
  return resolveReducer(accumulator, entity.value)
}

module.exports.resolve = resolve
