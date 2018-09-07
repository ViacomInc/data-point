const { traceReducer } = require('./trace-graph')

const {
  augmentTraceNodeDuration,
  augmentAccumulatorTrace
} = require('./trace-resolve')

module.exports = {
  traceReducer,
  augmentTraceNodeDuration,
  augmentAccumulatorTrace
}
