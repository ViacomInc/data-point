const set = require("lodash/set");

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @returns {Promise}
 */
async function resolve(manager, resolveReducer, accumulator, reducer) {
  const result = reducer.source();

  if (reducer.reducers.length === 0) {
    return result;
  }

  const promises = reducer.reducers.map(
    async ({ reducer: itemReducer, path }) => {
      const value = await resolveReducer(manager, accumulator, itemReducer);
      return set(result, path, value);
    }
  );

  await Promise.all(promises);

  return result;
}

module.exports.resolve = resolve;
