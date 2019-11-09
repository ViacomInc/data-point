const utils = require("../../../utils");

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerMap} reducerMap
 * @returns {Promise}
 */
function resolve(manager, resolveReducer, accumulator, reducerMap) {
  const reducer = reducerMap.reducer;

  const promises = accumulator.value.map(itemValue => {
    const itemContext = utils.set(accumulator, "value", itemValue);
    return resolveReducer(manager, itemContext, reducer);
  });

  return Promise.all(promises);
}

module.exports.resolve = resolve;
