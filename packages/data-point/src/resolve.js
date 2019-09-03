const uniqueIdScope = require("./unique-id-scope");
const traceSpan = require("./trace-span");

const pid = uniqueIdScope();

/**
 * Applies a Reducer to an accumulator
 * @alias resolve
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
    // because the error bubbles up, we only want to set `error.reducerStackTrace`
    // once, otherwise we end up with only the first item in the stack.
    if (!error.reducerStackTrace) {
      error.reducerStackTrace = acc.reducerStackTrace;
    }

    traceSpan.logError(span, error);

    // rethrow the error up
    throw error;
  } finally {
    traceSpan.finish(span);
  }
  return result;
}

module.exports = {
  resolve
};
