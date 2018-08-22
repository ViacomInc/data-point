const fs = require('fs')
const Promise = require('bluebird')

// this module is used to cover circular references
const stringify = require('json-stringify-safe')

const { NS_PER_SEC, nanoToMillisecond } = require('./time-helpers')

const writeFileP = Promise.promisify(fs.writeFile)
module.exports.writeFileP = writeFileP

/**
 * @param {ReducerSpec} reducer
 * @returns {Object} Reducer summary
 */
function createReducerSummary (reducer) {
  let functionName = ''
  let functionBody = ''

  if (reducer.type === 'ReducerFunction') {
    functionName = reducer.body.name || 'anonymous'
    functionBody = reducer.body.toString()
  }

  return {
    id: reducer.id || '',
    type: reducer.type,
    name: functionName || reducer.name || '',
    body: functionBody || ''
  }
}

module.exports.createReducerSummary = createReducerSummary

/**
 * @param {TraceNode} node Trace node input
 * @returns {string} generated string based off of reducer info and id
 */
function createTraceNodeLabel (node) {
  return `${node.reducer.id || node.reducer.type}:${node.id}`
}

module.exports.createTraceNodeLabel = createTraceNodeLabel

/**
 * Creates a Tree structure off of a trace stack
 * NOTE: Mutates currentNode argument, which as a result mutates traceGraph
 * mutation could be avoided but for the purpose of this operations it might be
 * an overkill
 * @param {TraceNode} currentNode
 * @param {Array<TraceNode>} traceGraph
 * @param {Number} nestingLevel
 * @param {Accumulator} accumulator
 */
function createTree (currentNode, traceGraph, nestingLevel, accumulator) {
  currentNode.durationMs = nanoToMillisecond(currentNode.duration)
  currentNode.timelineStart = currentNode.timeStart - accumulator.timeStart
  currentNode.timelineStartMs = nanoToMillisecond(currentNode.timelineStart)
  currentNode.nestingLevel = nestingLevel
  currentNode.label = createTraceNodeLabel(currentNode)

  currentNode.reducerSummary = createReducerSummary(currentNode.reducer)

  const children = traceGraph.filter(node => {
    return node.parent && node.parent.id === currentNode.id
  })

  currentNode.children = children

  nestingLevel += 1

  // update maxNestingLevel if new nestingLevel is higher
  if (nestingLevel > accumulator.maxNestingLevel) {
    accumulator.maxNestingLevel = nestingLevel
  }

  children.forEach(node => {
    createTree(node, traceGraph, nestingLevel, accumulator)
  })
}

module.exports.createTree = createTree

/**
 * @param {Tracenode} node
 */
function logGraph (node) {
  console.log(
    '%s%s %s S: %sms T: %sms',
    '  '.repeat(node.nestingLevel),
    node.nestingLevel,
    node.label,
    (node.timelineStart / NS_PER_SEC).toFixed(3),
    (node.duration / NS_PER_SEC).toFixed(3)
  )
  node.children.forEach(child => {
    logGraph(child)
  })
}

module.exports.logGraph = logGraph

/**
 * @param {Array<TraceNode>} traceGraph raw stack to write to disk
 */
function writeTraceGraph (traceGraph) {
  const root = traceGraph.find(node => !node.parent)
  const graphAcc = { timeStart: root.timeStart, maxNestingLevel: 0 }
  createTree(root, traceGraph, 0, graphAcc)
  root.maxNestingLevel = graphAcc.maxNestingLevel

  const date = Date.now()
  return module.exports.writeFileP(
    `data-point-trace-${date}.json`,
    stringify(root, null, '  '),
    'utf8'
  )
}

module.exports.writeTraceGraph = writeTraceGraph

function traceReducer (acc) {
  return writeTraceGraph(acc.traceGraph).return(acc)
}

module.exports.traceReducer = traceReducer
