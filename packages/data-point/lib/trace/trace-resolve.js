const uniqueId = require('lodash/uniqueId')

const NS_PER_SEC = 1e9

/**
 * @param {hrtime} time hrtime value
 * @returns {Integer} nanosecond
 */
function hrtimeTotNanosec (time) {
  return time[0] * NS_PER_SEC + time[1]
}

module.exports.hrtimeTotNanosec = hrtimeTotNanosec

/**
 * @param {hrtime} time hrtime value
 * @returns {Integer} duration between time argument and current time
 */
function getDuration (time) {
  const diff = process.hrtime(time)
  const nanosec = hrtimeTotNanosec(diff)
  return nanosec
}

module.exports.getDuration = getDuration

/**
 * NOTE: Mutates traceNode argument
 * @param {Object} traceNode
 * @returns {Function} returns (acc):acc
 */
function augmentTraceNodeDuration (traceNode) {
  return acc => {
    traceNode.duration = module.exports.getDuration(traceNode.hrtime)
    return acc
  }
}

module.exports.augmentTraceNodeDuration = augmentTraceNodeDuration

/**
 * @param {Accumulator} accumulator current accumulator
 * @param {Reducer} reducer
 * @returns {Accumulator} traced accumulator
 */
function createTracedAccumulator (accumulator, reducer) {
  const hrtime = process.hrtime()

  const traceNode = {
    id: uniqueId(),
    reducer,
    hrtime,
    timeStart: hrtimeTotNanosec(hrtime),
    parent: accumulator.traceNode
  }
  return Object.assign({}, accumulator, { traceNode })
}

module.exports.createTracedAccumulator = createTracedAccumulator

/**
 * Creates and adds new traceNode to traceGraph
 * @param {Accumulator} accumulator current accumulator
 * @returns {Accumulator} traced accumulator
 */
function augmentAccumulatorTrace (accumulator, reducer) {
  const acc = module.exports.createTracedAccumulator(accumulator, reducer)
  acc.traceGraph.push(acc.traceNode)
  return acc
}

module.exports.augmentAccumulatorTrace = augmentAccumulatorTrace
