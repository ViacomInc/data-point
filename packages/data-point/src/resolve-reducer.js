let pid = 0;

/**
 * Applies a Reducer to an accumulator
 *
 * If Accumulator.trace is true it will execute tracing actions
 *
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise}
 */
async function resolve(accumulator, reducer) {
  pid += 1;

  const acc = accumulator.create();
  acc.reducer = reducer;
  acc.pid = pid;

  let result;

  let span;
  if (acc.tracer && acc.tracer.startSpan) {
    const name = (acc.reducer && acc.reducer.id) || "init";
    span = acc.tracer.startSpan(name, {
      childOf: acc.tracer
    });

    // passing reference to accumulator to create child-parent relationship
    acc.tracer = span;

    span.setTag("pid", acc.pid);
  }

  try {
    // NOTE: recursive call by passing resolve method
    result = await reducer.resolveReducer(acc, resolve, reducer);
  } catch (error) {
    if (span && span.log) {
      span.log({
        event: "error",
        "error.object": error,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  } finally {
    if (span && span.finish) {
      span.finish();
    }
  }
  return result;
}

module.exports = {
  resolve
};
