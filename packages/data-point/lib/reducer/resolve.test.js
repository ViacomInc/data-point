/* eslint-env jest */
'use strict'

const Factory = require('./factory')
const Resolve = require('./resolve')

const reducers = require('../../test/utils/reducers')
const resolveReducerList = require('../reducer-list').resolve

const fixtureStore = require('../../test/utils/fixture-store')
const testData = require('../../test/data.json')

const AccumulatorFactory = require('../accumulator/factory')

let manager

beforeAll(() => {
  manager = fixtureStore.create()
})

describe('reducer.getReducerFunction', () => {
  test('resolve to ReducerPath', () => {
    const resolver = Resolve.getReducerFunction(
      manager,
      resolveReducerList,
      'ReducerPath'
    )
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerFunction', () => {
    const resolver = Resolve.getReducerFunction(
      manager,
      resolveReducerList,
      'ReducerFunction'
    )
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerEntity', () => {
    const resolver = Resolve.getReducerFunction(
      manager,
      resolveReducerList,
      'ReducerEntity'
    )
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerEntity', () => {
    expect(() => {
      Resolve.getReducerFunction(manager, resolveReducerList, 'INVALID TYPE')
    }).toThrow()
  })
})

test('resolve#reducer.resolve', () => {
  const accumulator = AccumulatorFactory.create({
    value: testData.a.b.c
  })

  const reducer = Factory.create(reducers.addCollectionValues())
  return Resolve.resolve(manager, accumulator, reducer).then(result => {
    expect(result.value).toEqual(6)
  })
})
