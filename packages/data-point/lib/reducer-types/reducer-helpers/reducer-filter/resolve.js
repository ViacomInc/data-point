const utils = require("../../../utils");
const { reducerPredicateIsTruthy } = require("../utils");

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFilter} reducerFilter
 * @returns {Promise}
 */
async function resolve(manager, resolveReducer, accumulator, reducerFilter) {
  const reducer = reducerFilter.reducer;

  if (!Array.isArray(accumulator.value)) {
    throw new Error(
      `Expecting an array or an iterable object but got ${accumulator.value}`
    );
  }

  const promises = accumulator.value.map(async itemValue => {
    const itemContext = utils.set(accumulator, "value", itemValue);
    const resolvedValue = await resolveReducer(manager, itemContext, reducer);
    return {
      value: itemValue,
      match: reducerPredicateIsTruthy(reducer, resolvedValue)
    };
  });

  const values = await Promise.all(promises);

  return values.reduce((matches, result) => {
    if (result.match) {
      matches.push(result.value);
    }

    return matches;
  }, []);
}

module.exports.resolve = resolve;
