/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerParallel} reducerParallel
 * @returns {Promise}
 */
function resolve(manager, resolveReducer, accumulator, reducerParallel) {
  const promises = reducerParallel.reducers.map(reducer => {
    return resolveReducer(manager, accumulator, reducer);
  });

  return Promise.all(promises);
}

module.exports.resolve = resolve;
