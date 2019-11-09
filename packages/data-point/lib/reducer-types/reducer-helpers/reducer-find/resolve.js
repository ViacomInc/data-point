const utils = require("../../../utils");
const { reducerPredicateIsTruthy } = require("../utils");

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFind} reducerFind
 * @returns {Promise}
 */
async function resolve(manager, resolveReducer, accumulator, reducerFind) {
  if (accumulator.value.length === 0) {
    return undefined;
  }

  const reducer = reducerFind.reducer;

  for (let index = 0; index < accumulator.value.length; index += 1) {
    const itemValue = accumulator.value[index];
    const itemContext = utils.set(accumulator, "value", itemValue);
    // eslint-disable-next-line no-await-in-loop
    const result = await resolveReducer(manager, itemContext, reducer);

    if (reducerPredicateIsTruthy(reducer, result)) {
      return itemValue;
    }
  }

  return undefined;
}

module.exports.resolve = resolve;
