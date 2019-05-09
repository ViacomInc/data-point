/* eslint-env jest */

const resolveEntryEntity = require('./resolve').resolve

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
  return Promise.resolve(true).then(() =>
    resolveEntryEntity(accumulator, resolveReducerBound)
  )
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
})

describe('Entry.resolve', () => {
  test('Entry#resolve - resolve empty', () => {
    return transform('entry:a0').then(result => {
      expect(result).toEqual({})
    })
  })
  test('Entry#resolve - resolve context', () => {
    return transform('entry:a1', testData.foo).then(result => {
      expect(result).toEqual(1)
    })
  })
})
