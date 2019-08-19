const uniqueIdScope = require("./unique-id-scope");
const traceSpan = require("./trace-span");

const pid = uniqueIdScope();

/**
 * Applies a Reducer to an accumulator
 *
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise}
 */
async function resolve(accumulator, reducer) {
  const acc = accumulator.create();
  acc.reducer = reducer;
  acc.pid = pid();

  const span = traceSpan.create(acc);

  let result;
  try {
    // NOTE: recursive call by passing resolve method
    result = await reducer.resolveReducer(acc, resolve);
  } catch (error) {
    traceSpan.logError(span, error);
    throw error;
  } finally {
    traceSpan.finish(span);
  }
  return result;
}

module.exports = {
  resolve
};
