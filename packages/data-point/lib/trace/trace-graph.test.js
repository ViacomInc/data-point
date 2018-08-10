/* eslint-env jest */

const TraceGraph = require('./trace-graph')
const set = require('lodash/set')
const { format } = require('util')

function createNode (index) {
  const time = index * 1e9
  return {
    id: `id${index}`,
    time,
    timeStart: time,
    duration: time + 20000,
    parent: null,
    reducer: {
      id: `reducerId${index}`,
      name: `reducerName${index}`
    }
  }
}

function createTraceGraph () {
  const traceGraph = Array(4)
    .fill(null)
    .map((val, index) => {
      return createNode(index)
    })

  traceGraph[1].parent = traceGraph[0]
  traceGraph[2].parent = traceGraph[0]
  traceGraph[3].parent = traceGraph[2]

  return traceGraph
}

function createGraph () {
  const traceGraph = createTraceGraph()
  const root = traceGraph[0]
  const graphAcc = { timeStart: root.timeStart, maxNestingLevel: 0 }
  TraceGraph.createTree(root, traceGraph, 0, graphAcc)
  return {
    root,
    graphAcc
  }
}

describe('createTraceNodeLabel', () => {
  it('should use name when available', () => {
    const node = {}
    set(node, 'id', 'nodeId')
    set(node, 'reducer.id', 'reducerId')
    set(node, 'reducer.name', 'reducerName')
    expect(TraceGraph.createTraceNodeLabel(node)).toEqual(
      'reducerId:nodeId (reducerName)'
    )
  })
  it('should not set name when not available', () => {
    const node = {}
    set(node, 'id', 'nodeId')
    set(node, 'reducer.id', 'reducerId')
    expect(TraceGraph.createTraceNodeLabel(node)).toEqual('reducerId:nodeId')
  })
  it('should use reducer type when id is not available', () => {
    const node = {}
    set(node, 'id', 'nodeId')
    set(node, 'reducer.type', 'reducerType')
    expect(TraceGraph.createTraceNodeLabel(node)).toEqual('reducerType:nodeId')
  })
})

describe('createTree', () => {
  it('should create parent child relationship', () => {
    const result = createGraph()
    expect(result.root).toMatchSnapshot()
  })

  it('should set maxNestingLevel', () => {
    const result = createGraph()
    expect(result.graphAcc.maxNestingLevel).toEqual(3)
  })
})

describe('logGraph', () => {
  let mockConsoleLog
  afterEach(() => {
    mockConsoleLog.mockRestore()
  })

  it('should log the tree', () => {
    const logs = []
    mockConsoleLog = jest
      .spyOn(console, 'log')
      .mockImplementation((...args) => {
        logs.push(format(...args))
      })

    TraceGraph.logGraph(createGraph().root)
    const logOutput = logs.join('\n')
    expect(logOutput).toMatchSnapshot()
  })
})

describe('writeTraceGraph', () => {
  let mockDateNow
  let mockWriteFileP
  beforeEach(() => {
    mockDateNow = jest.spyOn(Date, 'now').mockImplementation(() => {
      return 123
    })
    mockWriteFileP = jest
      .spyOn(TraceGraph, 'writeFileP')
      .mockImplementation(() => {
        return Promise.resolve(true)
      })
  })
  afterEach(() => {
    mockDateNow.mockRestore()
    mockWriteFileP.mockRestore()
  })
  it('should write graph to disk', () => {
    const traceGraph = createTraceGraph()
    return TraceGraph.writeTraceGraph(traceGraph).then(result => {
      expect(mockWriteFileP.mock.calls[0]).toMatchSnapshot()
    })
  })
})
