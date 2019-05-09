/* eslint-env jest */

const reducerPath = require('./index')
const createReducer = require('../index').create
const resolveReducer = require('../index').resolve
const AccumulatorFactory = require('../../accumulator/factory')
const FixtureStore = require('../../../test/utils/fixture-store')

let dataPoint

beforeAll(() => {
  dataPoint = FixtureStore.create()
})

describe('ReducerPath#resolve', () => {
  function resolve (value, reducerSource) {
    const locals = {
      a: ['testA']
    }
    const accumulator = AccumulatorFactory.create({
      value,
      locals
    })

    const reducer = reducerPath.create(createReducer, reducerSource)
    return reducerPath.resolve(dataPoint, resolveReducer, accumulator, reducer)
  }

  test('resolve current value', () => {
    const expected = {
      a: 1
    }
    return resolve(expected, '$').then(result => expect(result).toBe(expected))
  })

  test('resolve to context scope', () => {
    const expected = {
      a: 1
    }
    return resolve(expected, '$..value').then(result =>
      expect(result).toBe(expected)
    )
  })

  test('resolve to context scope, access locals', () => {
    return resolve({}, '$..locals.a[0]').then(result =>
      expect(result).toBe('testA')
    )
  })
})
