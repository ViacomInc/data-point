/* eslint-env jest */

const Factory = require('./factory')
const Resolve = require('./resolve')

const Reducer = require('../../index')

const DataPoint = require('../../../index')

const AccumulatorFactory = require('../../../accumulator/factory')

let manager

beforeAll(() => {
  manager = DataPoint.create()
})

describe('ReducerOmit#resolve', () => {
  test('It should return the accumulator when no keys are provided', () => {
    const value = {
      a: 1,
      b: 2
    }
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, [])
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual(value)
      }
    )
  })

  test('It should omit the given keys', () => {
    const value = {
      a: 1,
      b: 2,
      c: 3
    }
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, ['a', 'b', 'q'])
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual({
          c: 3
        })
      }
    )
  })
})
