/* eslint-env jest */

const RouteMiddleware = require('./route-middleware')
const Express = require('express')
const request = require('supertest')
const DataPoint = require('data-point')

describe('create - entity middleware', () => {
  let dataPoint
  beforeAll(() => {
    dataPoint = DataPoint.create({
      entities: {
        'reducer:my-test-query': (value, acc) => ({
          message: `Hello ${acc.locals.query.name}`
        }),
        'reducer:my-test-params': (value, acc) => ({
          message: `Hello ${acc.locals.params.name}`
        })
      }
    })
  })

  test('It should send information about generated error in transformation', done => {
    const app = new Express()
    app.use(
      '/api/bad-entity',
      RouteMiddleware.create(dataPoint, 'reducer:unknown')
    )
    request(app)
      .get('/api/bad-entity')
      .expect('Content-Type', /json/)
      .expect(({ body }) => {
        expect(body.type).toEqual('InvalidId')
        expect(body.message).toContain('unknown')
      })
      .expect(400)
      .end(done)
  })

  test('It should execute transform using query params', done => {
    const app = new Express()
    app.use(
      '/api/my-test-query',
      RouteMiddleware.create(dataPoint, 'reducer:my-test-query')
    )
    request(app)
      .get('/api/my-test-query?name=test')
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body.message).toContain('Hello test')
      })
      .expect(200)
      .end(done)
  })

  test('It should execute transform using route params', done => {
    const app = new Express()
    app.use(
      '/api/my-test-params/:name',
      RouteMiddleware.create(dataPoint, 'reducer:my-test-params')
    )
    request(app)
      .get('/api/my-test-params/test')
      .expect('Content-Type', /json/)
      .expect(res => {
        expect(res.body.message).toContain('Hello test')
      })
      .expect(200)
      .end(done)
  })
})
