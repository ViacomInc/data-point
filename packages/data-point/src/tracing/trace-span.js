/**
 * NOTE: mutates accumulator
 * @private
 * @param {*} accumulator
 */
function start(accumulator) {
  if (!accumulator.tracer) {
    return undefined;
  }

  const span = accumulator.tracer.start(accumulator.reducer.id, {
    context: accumulator,
    parent: accumulator.tracer
  });

  // passing reference to accumulator to create child-parent relationship
  accumulator.tracer = span;

  return span;
}
/**
 * @private
 * @param {Span} span
 * @param {Error} spanError
 */
function error(span, spanError) {
  if (!span) {
    return;
  }

  span.setError(spanError);
}

/**
 * @private
 * @param {Span} span
 */
function finish(span) {
  if (!span) {
    return;
  }

  span.finish();
}

module.exports = {
  start,
  error,
  finish
};
