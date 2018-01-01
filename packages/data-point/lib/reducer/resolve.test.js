/* eslint-env jest */
'use strict'

const Factory = require('./factory')
const Resolve = require('./resolve')

const reducers = require('../../test/utils/reducers')
const fixtureStore = require('../../test/utils/fixture-store')
const testData = require('../../test/data.json')

const AccumulatorFactory = require('../accumulator/factory')
const TransformExpression = require('../transform-expression')

let manager

beforeAll(() => {
  manager = fixtureStore.create()
})

describe('reducer.getReducerFunction', () => {
  test('resolve to ReducerPath', () => {
    const resolver = Resolve.getReducerFunction(
      manager,
      TransformExpression.resolve,
      'ReducerPath'
    )
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerFunction', () => {
    const resolver = Resolve.getReducerFunction(
      manager,
      TransformExpression.resolve,
      'ReducerFunction'
    )
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerEntity', () => {
    const resolver = Resolve.getReducerFunction(
      manager,
      TransformExpression.resolve,
      'ReducerEntity'
    )
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerEntity', () => {
    expect(() => {
      Resolve.getReducerFunction(
        manager,
        TransformExpression.resolve,
        'INVALID TYPE'
      )
    }).toThrow()
  })
})

test('resolve#reducer.resolve', () => {
  const accumulator = AccumulatorFactory.create({
    value: testData.a.b.c
  })

  const reducer = Factory.create(
    TransformExpression.create,
    reducers.addCollectionValues()
  )
  return Resolve.resolve(
    manager,
    TransformExpression.resolve,
    accumulator,
    reducer
  ).then(result => {
    expect(result.value).toEqual(6)
  })
})
