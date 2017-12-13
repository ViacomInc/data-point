/* eslint-env jest */
'use strict'

const Reducer = require('./reducer')

const FixtureStore = require('../../../test/utils/fixture-store')

const helpers = require('../../helpers')

let dataPoint
let resolveTransform

function transform (entityId, value, options) {
  const reducer = dataPoint.entities.get(entityId)
  const accumulator = helpers.createAccumulator(
    value,
    Object.assign(
      {
        context: reducer
      },
      options
    )
  )
  return Reducer.resolve(accumulator, resolveTransform)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveTransform = helpers.createResolveTransform(dataPoint)
})

describe('entity.transform.value', () => {
  test('should resolve value Transform', () => {
    return transform('transform:a0', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.value).toEqual('hello world')
    })
  })

  test('should resolve context Transform', () => {
    return transform('transform:a1', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.isResolved).toBe(false)
      expect(acc.value).toEqual('HELLO WORLD')
    })
  })

  test('should resolve early if it encounters accumulator.resolve', () => {
    return transform('transform:a2', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.isResolved).toBe(true)
      expect(acc.value).toBe('resolved value')
    })
  })

  test('should not change the resolved value if it reaches another accumulator.resolve', () => {
    return transform('transform:a3', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.isResolved).toBe(true)
      expect(acc.value).toBe('resolved value')
    })
  })
  test('should resolve with false', () => {
    return transform('transform:a4', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.isResolved).toBe(true)
      expect(acc.value).toBe(false)
    })
  })
  test('should resolve with undefined', () => {
    return transform('transform:a5', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.isResolved).toBe(true)
      expect(acc.value).toBe(undefined)
    })
  })
  test('should resolve with null', () => {
    return transform('transform:a6', {
      message: 'hello world'
    }).then(acc => {
      expect(acc.isResolved).toBe(true)
      expect(acc.value).toBe(null)
    })
  })
})
