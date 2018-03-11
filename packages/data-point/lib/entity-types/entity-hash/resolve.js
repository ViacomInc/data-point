/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec
  return resolveReducer(accumulator, entity.value, [['value']]).then(acc => {
    return resolveReducer(acc, entity.compose, [['compose']])
  })
}

module.exports.resolve = resolve
