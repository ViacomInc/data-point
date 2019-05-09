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

describe('ReducerMap#resolve', () => {
  test('It should return array with undefined elements when reducer is empty list', () => {
    const value = [true, true]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, [])
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual([undefined, undefined])
      }
    )
  })

  test('It should map an array of objects', () => {
    const value = [
      {
        a: 1
      },
      {
        a: 2
      }
    ]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, ['$a', value => value + 1])
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual([2, 3])
      }
    )
  })
})
