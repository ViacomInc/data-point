/* eslint-env jest */

const TraceResolve = require('./trace-resolve')

const NS_PER_SEC = 1e9

const mockedTime = [1, NS_PER_SEC * 1]

describe('augmentTraceNodeDuration', () => {
  let mockGetDuration
  afterAll(() => {
    mockGetDuration.mockRestore()
  })
  it('should set duration', () => {
    mockGetDuration = jest
      .spyOn(TraceResolve, 'getDuration')
      .mockImplementation(t => {
        return `${t}&duration`
      })
    const traceNode = {
      hrtime: 'hrtime'
    }
    expect(TraceResolve.augmentTraceNodeDuration(traceNode)(true)).toEqual(true)
    expect(traceNode).toHaveProperty('duration', 'hrtime&duration')
  })
})

describe('createTracedAccumulator', () => {
  let mockhrTime
  afterAll(() => {
    mockhrTime.mockRestore()
  })
  it('should create new accumulator with traceNode appended', () => {
    mockhrTime = jest.spyOn(process, 'hrtime').mockImplementation(t => {
      return mockedTime
    })
    const accumulator = {}
    const result = TraceResolve.createTracedAccumulator(accumulator, 'reducer')
    expect(mockhrTime).toBeCalled()
    expect(result).toMatchSnapshot()
    // should not mutate accumulator
    expect(accumulator).toEqual({})
  })
})

describe('augmentAccumulatorTrace', () => {
  let mockCreateTracedAccumulator
  afterAll(() => {
    mockCreateTracedAccumulator.mockRestore()
  })
  it('should create new accumulator with traceNode appended', () => {
    mockCreateTracedAccumulator = jest
      .spyOn(TraceResolve, 'createTracedAccumulator')
      .mockImplementation((input, reducer) => {
        return Object.assign({}, input, {
          traceNode: 'traceNode',
          reducer
        })
      })
    const acc = {
      traceGraph: []
    }
    const result = TraceResolve.augmentAccumulatorTrace(acc, 'reducer')
    expect(result).toMatchSnapshot()
  })
})
