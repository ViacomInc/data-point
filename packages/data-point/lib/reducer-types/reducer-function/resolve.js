/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @returns {Promise}
 */
async function resolve(manager, resolveReducer, accumulator, reducer) {
  return reducer.body(accumulator.value, accumulator);
}

module.exports.resolve = resolve;
