/**
 * NOTE: mutates accumulator
 * @param {*} accumulator
 */
function create(accumulator) {
  if (!accumulator.tracer || !accumulator.tracer.startSpan) {
    return undefined;
  }

  const span = accumulator.tracer.startSpan(accumulator.reducer.id, {
    childOf: accumulator.tracer
  });

  // passing reference to accumulator to create child-parent relationship
  accumulator.tracer = span;

  span.setTag("pid", accumulator.pid);

  return span;
}

function logError(span, error) {
  if (!span || !span.log) {
    return;
  }

  span.log({
    event: "error",
    "error.object": error,
    message: error.message,
    stack: error.stack
  });
}

function finish(span) {
  if (!span || !span.finish) {
    return;
  }

  span.finish();
}

module.exports = {
  create,
  logError,
  finish
};
