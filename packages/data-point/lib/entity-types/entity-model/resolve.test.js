/* eslint-env jest */

const Resolve = require('./resolve')

const FixtureStore = require('../../../test/utils/fixture-store')

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
  return Resolve.resolve(accumulator, resolveReducerBound)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
})

describe('Model.resolve', () => {
  test('Entry#resolve - resolve empty', () => {
    return transform('model:a.0').then(result => {
      expect(result.value).toEqual(undefined)
    })
  })
  test('Entry#resolve - resolve any Reducer', () => {
    return transform('model:a.1', 5).then(ac => {
      expect(ac.value).toEqual(10)
    })
  })
})
