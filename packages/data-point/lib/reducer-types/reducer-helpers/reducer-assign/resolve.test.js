/* eslint-env jest */

const Factory = require('./factory')
const Resolve = require('./resolve')

const Reducer = require('../../index')

const DataPoint = require('../../../index')

const AccumulatorFactory = require('../../../accumulator/factory')

let manager

beforeAll(() => {
  manager = DataPoint.create({
    entities: {
      'reducer:a': () => ({
        b: 22,
        c: 33
      })
    }
  })
})

describe('ReducerAssign#resolve', () => {
  test('It should work for empty objects', () => {
    const accumulator = AccumulatorFactory.create({
      value: {}
    })

    const reducer = Factory.create(Reducer.create, () => ({}))
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual({})
      }
    )
  })

  test('It should work for valid input', () => {
    const accumulator = AccumulatorFactory.create({
      value: {
        a: 1,
        b: 2
      }
    })

    const reducer = Factory.create(Reducer.create, 'reducer:a')
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual({
          a: 1,
          b: 22,
          c: 33
        })
      }
    )
  })

  test('It should not merge nested objects', () => {
    const accumulator = AccumulatorFactory.create({
      value: {
        a: 1,
        b: {
          a: 1
        }
      }
    })

    const reducer = Factory.create(Reducer.create, () => ({
      a: 1,
      b: {
        b: 2
      }
    }))

    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual({
          a: 1,
          b: {
            b: 2
          }
        })
      }
    )
  })
})
