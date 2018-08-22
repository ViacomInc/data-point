const uniqueId = require('lodash/uniqueId')
const { hrtimeTotNanosec, getDurationNs } = require('./time-helpers')

module.exports.getDurationNs = getDurationNs

/**
 * NOTE: Mutates traceNode argument
 * @param {Object} traceNode
 * @returns {Function} returns (acc):acc
 */
function augmentTraceNodeDuration (traceNode) {
  return acc => {
    traceNode.durationNs = module.exports.getDurationNs(traceNode.hrtime)
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
    timeStartNs: hrtimeTotNanosec(hrtime),
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
