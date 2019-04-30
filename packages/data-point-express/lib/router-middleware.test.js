/* eslint-env jest */

const RouterMiddleware = require('./router-middleware')
const Express = require('express')
const request = require('supertest')
const DataPoint = require('data-point')

describe('createRoutes', () => {
  test('It should create routes from options', () => {
    const mid = () => 1
    const routes = {
      a: {
        path: '/a',
        method: 'get',
        middleware: mid
      }
    }
    const app = new Express()
    app.get = jest.fn()
    RouterMiddleware.createRoutes(app, '/api', routes, {})
    expect(app.get).toBeCalledWith('/api/a', mid)
  })
})

describe('setupRoutes', () => {
  test('It should error if routes are missing', () => {
    expect(() => {
      RouterMiddleware.setupRouter()
    }).toThrowErrorMatchingSnapshot()
  })
})

describe('create - datapoint routes', () => {
  let dataPoint
  beforeAll(() => {
    dataPoint = DataPoint.create({
      entities: {
        'reducer:Test': (value, acc) => ({
          message: `Hello ${acc.locals.query.name}`
        })
      }
    })
  })
  test('It should return 400 if entityId query is missing', done => {
    const app = new Express()
    app.use(
      '/api',
      RouterMiddleware.create(dataPoint, {
        test: {
          priority: 100,
          path: '/test',
          middleware: 'reducer:Test'
        }
      })
    )

    request(app)
      .get('/api/test?name=test')
      .expect('Content-Type', /json/)
      .expect(({ body }) => {
        expect(body).toEqual({
          message: 'Hello test'
        })
      })
      .expect(200)
      .end(done)
  })
})
