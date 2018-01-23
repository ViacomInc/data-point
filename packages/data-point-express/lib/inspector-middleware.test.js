/* eslint-env jest */

jest.mock('ioredis', () => {
  return require('ioredis-mock')
})

const InspectorMiddleware = require('./inspector-middleware')
const Express = require('express')
const DataPoint = require('data-point')
const request = require('supertest')
const logger = require('./logger')
logger.clear()

describe.only('create - inspect middleware', () => {
  let dataPoint
  beforeAll(() => {
    dataPoint = DataPoint.create({
      entities: {
        'transform:test-params': (value, acc) => ({
          message: `Hello ${acc.locals.params.name}`
        }),
        'transform:test-query': (value, acc) => ({
          message: `Hello ${acc.locals.query.name}`
        }),
        'transform:test-value': (value, acc) => ({
          message: `Hello ${value}`
        })
      }
    })
  })

  test('Create an inspect HTML route', done => {
    const app = new Express()
    app.use('/inspect', InspectorMiddleware.create(dataPoint))
    request(app)
      .get('/inspect')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('inspect')
      })
      .expect(200)
      .end(done)
  })

  test('it should pass query value', done => {
    const body = {
      entityId: 'transform:test-query',
      query: {
        name: 'Foo'
      }
    }
    const app = new Express()
    app.use('/inspect', InspectorMiddleware.create(dataPoint))
    request(app)
      .post('/inspect')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual({
          message: 'Hello Foo'
        })
      })
      .expect(200)
      .end(done)
  })

  test('it should pass params value', done => {
    const body = {
      entityId: 'transform:test-params',
      params: {
        name: 'Foo'
      }
    }
    const app = new Express()
    app.use('/inspect', InspectorMiddleware.create(dataPoint))
    request(app)
      .post('/inspect')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual({
          message: 'Hello Foo'
        })
      })
      .expect(200)
      .end(done)
  })

  test('it should pass value to transform', done => {
    const body = {
      entityId: 'transform:test-value',
      value: 'Foo'
    }
    const app = new Express()
    app.use('/inspect', InspectorMiddleware.create(dataPoint))
    request(app)
      .post('/inspect')
      .send(body)
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual({
          message: 'Hello Foo'
        })
      })
      .expect(200)
      .end(done)
  })

  test('it should serve entities service', done => {
    const app = new Express()
    app.use('/inspect', InspectorMiddleware.create(dataPoint))
    request(app)
      .get('/inspect/entities')
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual([
          'transform:test-params',
          'transform:test-query',
          'transform:test-value'
        ])
      })
      .expect(200)
      .end(done)
  })
})
