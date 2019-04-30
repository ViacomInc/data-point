/* eslint-env jest */

jest.mock('../../data-point-cache/lib/io-redis', () => {
  return require('ioredis-mock')
})

const Factory = require('./factory')
const Express = require('express')
const request = require('supertest')

describe('create - all middleware', () => {
  let service
  const consoleWarn = console.warn
  beforeAll(() => {
    console.warn = () => {}
    const options = {
      entities: {
        'reducer:hello': (value, acc) => ({
          message: `Hello ${acc.locals.params.name}`
        })
      }
    }
    return Factory.create(options).then(dpService => {
      service = dpService
    })
  })

  afterAll(() => {
    console.warn = consoleWarn
  })

  test('create inspect service', done => {
    const app = new Express()
    app.use('/inspect', service.inspector())
    request(app)
      .get('/inspect')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('inspect')
      })
      .expect(200)
      .end(done)
  })

  test('create middleware', done => {
    const app = new Express()
    app.get('/hello/:name', service.mapTo('reducer:hello'))
    request(app)
      .get('/hello/darek')
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual({
          message: 'Hello darek'
        })
      })
      .expect(200)
      .end(done)
  })

  test('it should create router', done => {
    const app = new Express()
    app.use(
      '/api/',
      service.router({
        helloWorld: {
          path: '/hello/:name',
          middleware: 'reducer:hello'
        }
      })
    )
    request(app)
      .get('/api/hello/darek')
      .expect('Content-Type', /json/)
      .expect(response => {
        expect(response.body).toEqual({
          message: 'Hello darek'
        })
      })
      .expect(200)
      .end(done)
  })
})
