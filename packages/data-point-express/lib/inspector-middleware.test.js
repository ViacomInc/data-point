/* eslint-env jest */

const InspectorMiddleware = require('./inspector-middleware')
const Express = require('express')
const DataPoint = require('data-point')
const request = require('supertest')

describe('create - inspect middleware', () => {
  const consoleWarn = console.warn
  let dataPoint
  beforeAll(() => {
    console.warn = () => {}
    dataPoint = DataPoint.create({
      entities: {
        'reducer:test-params': (value, acc) => ({
          message: `Hello ${acc.locals.params.name}`
        }),
        'reducer:test-query': (value, acc) => ({
          message: `Hello ${acc.locals.query.name}`
        }),
        'reducer:test-value': (value, acc) => ({
          message: `Hello ${value}`
        })
      }
    })
  })

  afterAll(() => {
    console.warn = consoleWarn
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
      entityId: 'reducer:test-query',
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
      entityId: 'reducer:test-params',
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
      entityId: 'reducer:test-value',
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
          'reducer:test-params',
          'reducer:test-query',
          'reducer:test-value'
        ])
      })
      .expect(200)
      .end(done)
  })
})
