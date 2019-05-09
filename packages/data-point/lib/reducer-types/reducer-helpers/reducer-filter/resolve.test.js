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

describe('ReducerFilter#resolve', () => {
  test('It should return empty array when reducer is empty reducer list', () => {
    const value = [true, true]
    const accumulator = AccumulatorFactory.create({ value })
    const reducer = Factory.create(Reducer.create, [])
    return Resolve.resolve(manager, Reducer.resolve, accumulator, reducer).then(
      result => {
        expect(result).toEqual([])
      }
    )
  })

  test('It should filter an array of objects', () => {
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
        expect(result).toEqual([
          {
            a: 2
          }
        ])
      }
    )
  })

  describe('ReducerFind#resolve with reducer objects', () => {
    test('it should filter values that resolve with falsy keys', () => {
      const value = [
        {
          a: undefined
        },
        {
          a: 'undefined'
        },
        {
          a: null
        },
        {
          a: ''
        },
        {
          a: 0
        },
        {
          a: 'hello'
        },
        {
          a: 5
        },
        {
          a: NaN
        },
        {
          a: []
        },
        {
          a: {}
        }
      ]
      const accumulator = AccumulatorFactory.create({ value })
      const reducer = Factory.create(Reducer.create, {
        a: '$a'
      })
      return Resolve.resolve(
        manager,
        Reducer.resolve,
        accumulator,
        reducer
      ).then(result => {
        expect(result).toEqual([
          {
            a: 'undefined'
          },
          {
            a: 0
          },
          {
            a: 'hello'
          },
          {
            a: 5
          },
          {
            a: []
          },
          {
            a: {}
          }
        ])
      })
    })
  })
})
