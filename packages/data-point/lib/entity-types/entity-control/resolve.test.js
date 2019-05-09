/* eslint-env jest */

const resolveControlEntity = require('./resolve').resolve

const FixtureStore = require('../../../test/utils/fixture-store')
const testData = require('../../../test/data.json')

const helpers = require('../../helpers')

let dataPoint
let resolveReducerBound

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
  return resolveControlEntity(accumulator, resolveReducerBound)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
})

describe('entity-control#resolve', () => {
  test('test match first case', () => {
    return transform('control:a.1.0', testData).then(result => {
      expect(result).toEqual('a')
    })
  })
  test('test match second case', () => {
    return transform('control:a.1.1', testData).then(result => {
      expect(result).toEqual('b')
    })
  })
  test('test match none so use default', () => {
    return transform('control:a.1.2', testData).then(result => {
      expect(result).toEqual('c')
    })
  })

  // README: reducer could skip it if not setup currectly
  test('test error gets rethrown', () => {
    return transform('control:a.2', testData)
      .catch(err => {
        return err
      })
      .then(result => {
        expect(result).toBeInstanceOf(Error)
      })
  })
})
