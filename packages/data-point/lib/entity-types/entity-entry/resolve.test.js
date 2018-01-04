/* eslint-env jest */
'use strict'

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
  return resolveEntryEntity(accumulator, resolveReducerBound)
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
})

describe('Entry.resolve', () => {
  test('Entry#resolve - resolve empty', () => {
    return transform('entry:a0').then(result => {
      expect(result.value).toEqual({})
    })
  })
  test('Entry#resolve - resolve context', () => {
    return transform('entry:a1', testData).then(result => {
      expect(result.value).toEqual(1)
    })
  })
})
