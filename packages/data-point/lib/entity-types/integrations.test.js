/* eslint-env jest */

const _ = require('lodash')
const nock = require('nock')
const FixtureStore = require('../../test/utils/fixture-store')
const TestData = require('../../test/data.json')
const Promise = require('bluebird')

let dataPoint

beforeAll(() => {
  dataPoint = FixtureStore.create()
})

beforeEach(() => {
  dataPoint.middleware.clear()
})

test('Entry#resolve - branch/leaf nesting', () => {
  return dataPoint.resolve('hash:branchLeafNesting', TestData).then(result => {
    expect(result).toEqual({
      label: '1',
      leafs: [
        {
          label: '1.0',
          leafs: []
        },
        {
          label: '1.1',
          leafs: [
            {
              label: '1.1.0',
              leafs: []
            },
            {
              label: '1.1.1',
              leafs: []
            }
          ]
        }
      ]
    })
  })
})

test('Request should use resolved value as url, when url is missing', () => {
  const expected = {
    ok: true
  }

  nock('http://remote.test')
    .get('/source1')
    .reply(200, expected)

  return dataPoint.resolve('request:a3.1', {}).then(result => {
    expect(result).toEqual(expected)
  })
})

test('Entry#resolve - resolve request', () => {
  const expected = {
    ok: true
  }

  nock('http://remote.test')
    .get('/source1')
    .reply(200, expected)

  return dataPoint.resolve('entry:callRequest', {}).then(result => {
    expect(result).toEqual(expected)
  })
})

test('Entry#resolve - request uses locals object', () => {
  const expected = {
    ok: true
  }

  nock('http://remote.test')
    .get('/source1')
    .reply(200, expected)

  const options = {
    locals: {
      itemPath: '/source1'
    }
  }
  return dataPoint
    .resolve('entry:callDynamicRequestFromLocals', {}, options)
    .then(result => {
      expect(result).toEqual(expected)
    })
})

test('Entry#resolve - resolve hash with request', () => {
  const expected = {
    ok: true
  }

  nock('http://remote.test')
    .get('/source1')
    .reply(200, expected)

  return dataPoint.resolve('entry:hashThatCallsRequest', {}).then(result => {
    expect(result).toEqual(expected)
  })
})

test('Entry#resolve - resolve hash with request and hash reducers', () => {
  const expected = {
    newOk: 'trueok',
    ok: true
  }

  nock('http://remote.test')
    .get('/source1')
    .reply(200, {
      ok: true
    })

  return dataPoint
    .resolve('entry:callHashWithRequestAndExtendResult', {})
    .then(result => {
      expect(result).toEqual(expected)
    })
})

test('Entry#resolve - resolve model with multiple sources', () => {
  const expected = {
    s1: 'source1',
    s2: 'source2'
  }

  nock('http://remote.test')
    .get('/source1')
    .reply(200, {
      source: 'source1'
    })

  nock('http://remote.test')
    .get('/source2')
    .reply(200, {
      source: 'source2'
    })

  return dataPoint
    .resolve('entry:callHashThatCallsMultipleRequests', {})
    .then(result => {
      expect(result).toEqual(expected)
    })
})

test('Entry#resolve - resolve model with dynamic sources collection', () => {
  const expected = [
    {
      result: 'source2'
    },
    {
      result: 'source3'
    }
  ]

  nock('http://remote.test')
    .get('/source1')
    .reply(200, {
      sources: [
        {
          itemPath: '/source2'
        },
        {
          itemPath: '/source3'
        }
      ]
    })

  nock('http://remote.test')
    .get('/source2')
    .reply(200, {
      result: 'source2'
    })

  nock('http://remote.test')
    .get('/source3')
    .reply(200, {
      result: 'source3'
    })

  return dataPoint
    .resolve('entry:nestedRequests', {})
    .then(result => expect(result).toEqual(expected))
})

test('Entry#resolve:middleware(entry:after) - gets called', () => {
  const expected = {
    ok: true
  }

  nock('http://remote.test')
    .get('/source1')
    .reply(200, expected)

  dataPoint.middleware.clear()

  dataPoint.middleware.use('entry:after', (acc, next) => {
    expect(acc.context.id).toBe('entry:callRequest')
    next(null)
  })

  return dataPoint.resolve('entry:callRequest', {}).then(result => {
    expect(result).toEqual(expected)
  })
})

test('Entry#resolve - run schema, fail if invalid', () => {
  return dataPoint
    .resolve('schema:checkHashSchemaInvalid', TestData)
    .catch(err => err)
    .then(result => expect(result).toBeInstanceOf(Error))
})

test('Entry#resolve - run schema, pass value if valid', () => {
  return dataPoint
    .resolve('schema:checkHashSchemaValid', TestData)
    .then(result => expect(result).toBeTruthy())
})

test('Model Entity Instance', () => {
  const Model = require('./entity-model')
  const model = Model('myModel', {
    value: value => value * 10
  })
  return dataPoint
    .resolve(model, 10)
    .then(result => expect(result).toEqual(100))
})

describe('trace feature', () => {
  let mockDateNow
  let mockWriteFileP
  let mockhrTime
  afterEach(() => {
    mockDateNow.mockRestore()
    mockWriteFileP.mockRestore()
    mockhrTime.mockRestore()
  })

  test('trace via options parameter', () => {
    let calls = 0
    const NS_PER_SEC = 1e9
    mockhrTime = jest.spyOn(process, 'hrtime').mockImplementation(t => {
      calls++
      return [calls, NS_PER_SEC * calls]
    })
    mockDateNow = jest.spyOn(Date, 'now').mockImplementation(() => {
      return 123
    })
    const TraceGraph = require('../trace/trace-graph')
    mockWriteFileP = jest
      .spyOn(TraceGraph, 'writeFileP')
      .mockImplementation(() => {
        return Promise.resolve(true)
      })

    return dataPoint
      .resolve('model:tracedViaOptions', TestData, {
        trace: true
      })
      .then(result => {
        expect(mockWriteFileP.mock.calls).toMatchSnapshot()
      })
  })

  test('trace via entity params', () => {
    const consoleTime = console.time
    const consoleTimeEnd = console.timeEnd

    const timeIds = []
    console.time = id => {
      timeIds.push({
        type: 'time',
        id: id
      })
    }
    console.timeEnd = id => {
      timeIds.push({
        type: 'timeEnd',
        id: id
      })
    }
    return dataPoint.resolve('model:tracedViaParams', TestData).then(result => {
      console.time = consoleTime
      console.timeEnd = consoleTimeEnd
      const ids = _.map(timeIds, 'id')
      expect(ids[0]).toContain('⧖ model:tracedViaParams:')
    })
  })
})

describe('handle undefined value', () => {
  test('HashEntity - should throw error', () => {
    return dataPoint
      .resolve('hash:noValue', {})
      .catch(e => e)
      .then(res => {
        expect(res).toBeInstanceOf(Error)
      })
  })

  test('CollectionEntity - should throw error', () => {
    return dataPoint
      .resolve('collection:noValue', {})
      .catch(e => e)
      .then(res => {
        expect(res).toBeInstanceOf(Error)
      })
  })

  test('CollectionEntity - should ignore input', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })
    return dataPoint
      .resolve('request:a1', {})
      .catch(e => e)
      .then(res => {
        expect(res).toEqual({
          ok: true
        })
      })
  })
})
