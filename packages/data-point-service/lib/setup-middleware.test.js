/* eslint-env jest */

const SetupMiddleware = require('./setup-middleware')

describe('setupMiddleware', () => {
  test('It should setup middleware', () => {
    const service = {
      dataPoint: require('data-point').create(),
      settings: {}
    }
    return SetupMiddleware.setupMiddleware(service)
      .then(s => {
        expect(s).toHaveProperty('dataPoint.middleware.stack.length', 2)
        expect(s).toHaveProperty('dataPoint.middleware.stack.0.name', 'before')
        expect(s).toHaveProperty('dataPoint.middleware.stack.1.name', 'after')
      })
      .catch(err => console.log(err))
  })

  test('It should use custom before/after if provided', () => {
    const service = {
      dataPoint: require('data-point').create(),
      settings: {
        before: 'before',
        after: 'after'
      }
    }
    return SetupMiddleware.setupMiddleware(service)
      .then(s => {
        expect(s).toHaveProperty('dataPoint.middleware.stack.length', 2)
        expect(s).toHaveProperty(
          'dataPoint.middleware.stack.0.callback',
          'before'
        )
        expect(s).toHaveProperty(
          'dataPoint.middleware.stack.1.callback',
          'after'
        )
      })
      .catch(err => console.log(err))
  })
})
