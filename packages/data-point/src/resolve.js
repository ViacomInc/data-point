const uniqueIdScope = require("./unique-id-scope");
const traceSpan = require("./tracing/trace-span");

const pid = uniqueIdScope();
const createThreadId = uniqueIdScope();

/**
 * Applies a Reducer to an accumulator
 * @alias resolve
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise}
 */
async function resolve(accumulator, reducer, newThread = false) {
  const acc = accumulator.create();
  acc.reducer = reducer;

  if (newThread) {
    acc.threadId = createThreadId();
  }

  acc.pid = pid();

  const span = traceSpan.start(acc, accumulator.reducer);

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

    // only set error.reducer once so any following catch does not override the
    // original reducer.
    if (!error.reducer) {
      error.reducer = reducer;
    }

    traceSpan.error(span, error);

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
