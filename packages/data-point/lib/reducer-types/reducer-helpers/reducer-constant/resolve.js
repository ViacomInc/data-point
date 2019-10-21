/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerConstant} reducerConstant
 * @returns {Promise}
 */
function resolve(manager, resolveReducer, accumulator, reducerConstant) {
  return reducerConstant.value;
}

module.exports.resolve = resolve;
