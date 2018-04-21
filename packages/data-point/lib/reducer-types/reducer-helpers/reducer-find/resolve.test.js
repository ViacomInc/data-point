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

describe('ReducerFind#resolve', () => {
  test('It should return undefined when input is an empty array', () => {
    const value = []
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, [])
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toBeUndefined()
      }
    )
  })

  test('It should find a matching object', () => {
    const value = [
      {
        a: 1
      },
      {
        a: 2
      }
    ]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, ['$a', value => value > 1])
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual({
          a: 2
        })
      }
    )
  })

  test("it should find a matching item that's falsy", () => {
    const value = [0, 1, 2]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, input => input === 0)
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toBe(0)
      }
    )
  })

  test('It should return undefined when no match is found', () => {
    const value = [
      {
        a: 1
      },
      {
        a: 2
      }
    ]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, '$c')
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toBeUndefined()
      }
    )
  })
})

describe('ReducerFind#resolve with reducer objects', () => {
  test('it should not find a match when keys are null or undefined', () => {
    const value = [
      {
        a: undefined,
        b: undefined
      },
      {
        a: null,
        b: null
      }
    ]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, {
      a: '$a',
      b: '$b'
    })
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toBeUndefined()
      }
    )
  })

  test('it should match the item with truthy keys', () => {
    const value = [
      {
        a: true,
        b: undefined
      },
      {
        a: true,
        b: ''
      },
      {
        a: null,
        b: true
      },
      {
        a: 'a truthy string',
        b: true
      }
    ]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, {
      a: '$a',
      b: '$b'
    })
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual(value[3])
      }
    )
  })
})
