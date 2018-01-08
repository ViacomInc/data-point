/* eslint-env jest */
'use strict'

const Factory = require('./factory')
const Resolve = require('./resolve')

const reducers = require('../../test/utils/reducers')

const fixtureStore = require('../../test/utils/fixture-store')
const testData = require('../../test/data.json')

const AccumulatorFactory = require('../accumulator/factory')

let manager

beforeAll(() => {
  manager = fixtureStore.create()
})

describe('reducer#resolve', () => {
  test('It should work for valid input', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.a.b.c
    })

    const reducer = Factory.create(reducers.addCollectionValues())
    return Resolve.resolve(manager, accumulator, reducer).then(result => {
      expect(result.value).toEqual(6)
    })
  })

  test('It should throw error for invalid input', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.a.b.c
    })

    const reducer = { type: 'INVALID TYPE' }
    expect(() => {
      Resolve.resolve(manager, accumulator, reducer)
    }).toThrowErrorMatchingSnapshot()
  })
})
