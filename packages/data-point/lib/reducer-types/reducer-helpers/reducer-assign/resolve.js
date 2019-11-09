/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerAssign} reducerAssign
 * @returns {Promise}
 */
async function resolve(manager, resolveReducer, accumulator, reducerAssign) {
  const reducer = reducerAssign.reducer;
  const value = await resolveReducer(manager, accumulator, reducer);
  return Object.assign({}, accumulator.value, value);
}

module.exports.resolve = resolve;
