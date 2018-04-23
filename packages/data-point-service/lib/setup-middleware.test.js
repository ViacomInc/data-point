/* eslint-env jest */

const SetupMiddleware = require('./setup-middleware')

describe('setupMiddleware', () => {
  test('It should setup middleware', () => {
    const service = {
      dataPoint: require('data-point').create(),
      settings: {}
    }
    return SetupMiddleware.setupMiddleware(service)
      .catch(err => err)
      .then(s => {
        expect(s.dataPoint.middleware.store.size).toBe(2)

        const before = s.dataPoint.middleware.store.get('before')
        expect(before).toBeInstanceOf(Array)
        expect(before).toHaveLength(1)
        expect(before[0]).toBeInstanceOf(Function)

        const after = s.dataPoint.middleware.store.get('after')
        expect(after).toBeInstanceOf(Array)
        expect(after).toHaveLength(1)
        expect(after[0]).toBeInstanceOf(Function)
      })
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
      .catch(err => err)
      .then(s => {
        expect(s.dataPoint.middleware.store.get('before')).toEqual(['before'])
        expect(s.dataPoint.middleware.store.get('after')).toEqual(['after'])
      })
  })
})
