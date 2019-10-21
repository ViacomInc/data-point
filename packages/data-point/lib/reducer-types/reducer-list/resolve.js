const utils = require("../../utils");

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerList} reducerList
 * @returns {Promise}
 */
async function resolve(manager, resolveReducer, accumulator, reducerList) {
  const reducers = reducerList.reducers;
  if (reducers.length === 0) {
    return undefined;
  }

  let value = accumulator.value === undefined ? null : accumulator.value;

  for (let index = 0; index < reducers.length; index += 1) {
    const reducer = reducers[index];
    const itemContext = utils.set(accumulator, "value", value);
    // eslint-disable-next-line no-await-in-loop
    value = await resolveReducer(manager, itemContext, reducer);
  }

  return value;
}

module.exports.resolve = resolve;
