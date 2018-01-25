/* eslint-env jest */

const createReducerObject = require('./index').create
const resolveReducerObject = require('./index').resolve
const createReducer = require('../index').create
const resolveReducer = require('../index').resolve
const AccumulatorFactory = require('../../accumulator/factory')
const FixtureStore = require('../../../test/utils/fixture-store')

let dataPoint

beforeAll(() => {
  dataPoint = FixtureStore.create()
})

describe('resolve#reducerObject.resolve', () => {
  it('should return the accumulator for an empty reducer object', () => {
    const reducer = createReducerObject(createReducer, {})

    const accumulator = AccumulatorFactory.create({
      value: {
        x: {
          y: {
            z: 2
          }
        }
      }
    })

    return resolveReducerObject(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    ).then(result => {
      expect(result.value).toEqual(accumulator.value)
    })
  })

  it('should resolve a reducer object for reducer that changes value', () => {
    const accumulator = AccumulatorFactory.create({
      value: {
        x: {
          y: {
            z: 2
          }
        }
      }
    })

    const reducer = createReducerObject(createReducer, {
      y: '$x.y',
      zPlusOne: ['$x.y.z', input => input + 1]
    })

    return resolveReducerObject(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    ).then(result => {
      expect(result.value).toEqual({
        y: {
          z: 2
        },
        zPlusOne: 3
      })
    })
  })

  it('should resolve a reducer object that has reducer object inside reducer', () => {
    const accumulator = AccumulatorFactory.create({
      // this is the input
      value: {
        a: 'A',
        b: 'B',
        c: {
          x: 'X',
          y: 'Y'
        }
      }
    })

    const reducer = createReducerObject(createReducer, {
      // this is the function itself
      x: '$c.x',
      y: '$c.y',
      z: {
        a: '$a',
        b: '$b'
      }
    })

    return resolveReducerObject(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    ).then(result => {
      expect(result.value).toEqual({
        x: 'X',
        y: 'Y',
        z: {
          a: 'A',
          b: 'B'
        }
      })
    })
  })

  it('it should resolve a reducer object whose value follows input schematics', () => {
    const accumulator = AccumulatorFactory.create({
      value: {
        a: {
          a: 1,
          b: 2
        }
      }
    })

    const reducer = createReducerObject(createReducer, {
      x: [
        '$a',
        {
          a: '$a'
        }
      ],
      y: [
        {
          a: '$a'
        },
        '$a'
      ]
    })

    return resolveReducerObject(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    ).then(result => {
      expect(result.value).toEqual({
        x: {
          a: 1
        },
        y: {
          a: 1,
          b: 2
        }
      })
    })
  })
})
