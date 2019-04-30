/* eslint-env jest */

const fp = require('lodash/fp')
const Middleware = require('./middleware')
const Express = require('express')
const request = require('supertest')
const DataPoint = require('data-point')

function createReq () {
  const app = {
    locals: {}
  }
  const req = {
    query: {
      queryVar: 'queryVar'
    },
    params: {
      paramVar: 'paramVar',
      queryVar: 'queryVarOverriden'
    },
    url: 'http://some.domain.com/api/route/?key=value',
    app
  }
  return req
}

describe('buildTransformOptions', () => {
  const req = createReq()

  test('It should have locals object', () => {
    const result = Middleware.buildTransformOptions(req)
    expect(result).toHaveProperty('locals')
  })

  test('It should have locals expose query', () => {
    const result = Middleware.buildTransformOptions(req)
    expect(result).toHaveProperty('locals.query', {
      queryVar: 'queryVar'
    })
  })

  test('It should have locals expose params', () => {
    const result = Middleware.buildTransformOptions(req)
    expect(result).toHaveProperty('locals.params')
  })

  test('It should have locals.url from req', () => {
    const result = Middleware.buildTransformOptions(req)
    expect(result).toHaveProperty(
      'locals.url',
      'http://some.domain.com/api/route/?key=value'
    )
  })

  test('It should have locals.resetCache false by default', () => {
    const result = Middleware.buildTransformOptions(req)
    expect(result).toHaveProperty('locals.resetCache', false)
  })

  test("It should have locals.resetCache true if req.query.resetCache was passed as 'true'", () => {
    const result = Middleware.buildTransformOptions(
      fp.set('query.resetCache', 'true', req)
    )
    expect(result).toHaveProperty('locals.resetCache', true)
  })

  test('It should have locals.queryParams merge of query into params', () => {
    const result = Middleware.buildTransformOptions(req, {
      routeParams: {
        paramVar: 'paramVar',
        queryVar: 'queryVarOverriden'
      }
    })
    expect(result).toHaveProperty('locals.queryParams', {
      queryVar: 'queryVar',
      paramVar: 'paramVar'
    })
  })

  test('It should have locals.paramsQuery merge of params into query', () => {
    const result = Middleware.buildTransformOptions(req, {
      routeParams: {
        paramVar: 'paramVar',
        queryVar: 'queryVarOverriden'
      }
    })
    expect(result).toHaveProperty('locals.paramsQuery', {
      queryVar: 'queryVarOverriden',
      paramVar: 'paramVar'
    })
  })

  test('It should have trace false by default', () => {
    const result = Middleware.buildTransformOptions(req)
    expect(result).toHaveProperty('trace', false)
  })

  test('It should have locals.req be a reference to the original req object', () => {
    const result = Middleware.buildTransformOptions(req)
    expect(result).toHaveProperty('locals.req', req)
  })

  test('It should set locals.routeRequestType', () => {
    const result = Middleware.buildTransformOptions(req, {
      routeRequestType: 'foo'
    })
    expect(result).toHaveProperty('locals.routeRequestType', 'foo')
  })

  test('It should set locals.pathname', () => {
    const result = Middleware.buildTransformOptions(req, {
      pathname: 'route/'
    })
    expect(result).toHaveProperty('locals.pathname', 'route/')
  })
})

describe('getErrorOwnKeys', () => {
  test('It should get own keys from object | where error is an error object, should omit name and message', () => {
    const err = new Error('message')
    err.name = 'name'
    err.test = 'test'
    expect(Middleware.getErrorOwnKeys(err)).toEqual({
      test: 'test'
    })
  })
  test('It should get own keys from object | where error is an regular object should pass enumerable keys ', () => {
    expect(
      Middleware.getErrorOwnKeys({
        a: 1,
        b: 2
      })
    ).toEqual({
      a: 1,
      b: 2
    })
  })
  test('It should handle circular references, bad keys contain its error instance', () => {
    const object = {
      a: 1,
      b: 2
    }
    object.c = object
    const safeKeys = Middleware.getErrorOwnKeys(object)
    expect(safeKeys).toHaveProperty('a', 1)
    expect(safeKeys).toHaveProperty('b', 2)
    expect(safeKeys.c).toContain('circular')
  })
})

describe('createErrorMessage', () => {
  test('It should output error information', () => {
    const err = new Error('message')
    err.name = 'name'
    err.test = 'test'
    expect(Middleware.createErrorMessage(err)).toEqual({
      type: 'name',
      message: 'message',
      info: {
        test: 'test'
      }
    })
  })
})

describe('resolveReducer', () => {
  let dataPoint
  beforeAll(() => {
    dataPoint = DataPoint.create({
      entities: {
        'reducer:string': () => `Test`,
        'reducer:object': () => ({
          test: `Test`
        }),
        'reducer:value': value => `Test ${value}`
      }
    })
  })

  test('it should resolve text response', done => {
    const app = new Express()
    app.get('/test', (req, res) => {
      return Middleware.resolveReducer(dataPoint, 'reducer:string', {}, res)
    })
    request(app)
      .get('/test')
      .expect('Content-Type', /text/)
      .expect(response => {
        expect(response.text).toEqual('Test')
      })
      .expect(200)
      .end(done)
  })

  test('it should resolve object response', done => {
    const app = new Express()
    app.get('/test', (req, res) => {
      return Middleware.resolveReducer(dataPoint, 'reducer:object', {}, res)
    })
    request(app)
      .get('/test')
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual({
          test: 'Test'
        })
      })
      .expect(200)
      .end(done)
  })

  test('it should resolve passing initial value', done => {
    const app = new Express()
    app.get('/test', (req, res) => {
      return Middleware.resolveReducer(
        dataPoint,
        'reducer:value',
        {},
        res,
        'TEST'
      )
    })
    request(app)
      .get('/test')
      .expect('Content-Type', /text/)
      .expect(response => {
        expect(response.text).toEqual('Test TEST')
      })
      .expect(200)
      .end(done)
  })
})
