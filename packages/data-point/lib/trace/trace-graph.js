const fs = require('fs')
const Promise = require('bluebird')

// this module is used to cover circular references
const stringify = require('json-stringify-safe')

const writeFileP = Promise.promisify(fs.writeFile)
module.exports.writeFileP = writeFileP

const NS_PER_SEC = 1e9
/**
 * @param {TraceNode} node create node label
 * @returns {string} generated string based off of reducer info and id
 */
function createTraceNodeLabel (node) {
  const name = node.reducer.name ? ` (${node.reducer.name})` : ''
  return `${node.reducer.id || node.reducer.type}:${node.id}${name}`
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
  currentNode.durationMs = currentNode.duration / NS_PER_SEC
  currentNode.timelineStart = currentNode.timeStart - accumulator.timeStart
  currentNode.timelineStartMs = currentNode.timelineStart / NS_PER_SEC
  currentNode.nestingLevel = nestingLevel
  currentNode.label = createTraceNodeLabel(currentNode)

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
