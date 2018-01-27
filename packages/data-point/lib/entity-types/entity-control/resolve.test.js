/* eslint-env jest */

const resolveControlEntity = require('./resolve').resolve

const FixtureStore = require('../../../test/utils/fixture-store')
const testData = require('../../../test/data.json')

const helpers = require('../../helpers')

let dataPoint
let resolveReducerBound

function transform (entityId, value, options, stack) {
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
  return resolveControlEntity(accumulator, resolveReducerBound, stack)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
})

describe('entity-control#resolve', () => {
  test('test match first case', () => {
    return transform('control:a.1.0', testData, {}, []).then(result => {
      expect(result.value).toEqual('a')
    })
  })

  test('test match second case', () => {
    return transform('control:a.1.1', testData, {}, []).then(result => {
      expect(result.value).toEqual('b')
    })
  })

  test('test match none so use default', () => {
    return transform('control:a.1.2', testData, {}, []).then(result => {
      expect(result.value).toEqual('c')
    })
  })

  // README: reducer could skip it if not setup currectly
  test('test error gets rethrown', () => {
    return transform('control:a.2.0', testData, {}, [])
      .catch(err => err)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
      })
  })

  test('test error gets rethrown', () => {
    return transform('control:a.2.0', testData, {})
      .catch(err => err)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
      })
  })

  test('error gets thrown from do case with no reducer stack', () => {
    return transform('control:a.2.1', testData, {})
      .catch(err => err)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result).not.toHaveProperty('rstack')
        expect(result).not.toHaveProperty('rvalue')
      })
  })

  test('error gets thrown from default case with no reducer stack', () => {
    return transform('control:a.2.2', testData, {})
      .catch(err => err)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result).not.toHaveProperty('rstack')
        expect(result).not.toHaveProperty('rvalue')
      })
  })
})
