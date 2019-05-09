/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerAssign} reducerAssign
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerAssign) {
  const reducer = reducerAssign.reducer
  return resolveReducer(manager, accumulator, reducer).then(value => {
    return Object.assign({}, accumulator.value, value)
  })
}

module.exports.resolve = resolve
