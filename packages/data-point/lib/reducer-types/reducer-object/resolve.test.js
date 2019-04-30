/* eslint-env jest */

const createReducerObject = require('./index').create
const resolveReducerObject = require('./index').resolve
const createReducer = require('../index').create
const resolveReducer = require('../index').resolve
const AccumulatorFactory = require('../../accumulator/factory')
const FixtureStore = require('../../../test/utils/fixture-store')
const constant = require('../..').constant

let dataPoint

beforeAll(() => {
  dataPoint = FixtureStore.create()
})

describe('resolve#reducerObject.resolve', () => {
  it('should return an empty object when the reducer object is empty', () => {
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
      expect(result).toEqual({})
    })
  })

  it('should resolve a nested reducer object #1', () => {
    const reducer = createReducerObject(createReducer, {
      x: constant([1, 2]),
      y: {
        a: constant({
          p1: 1,
          p2: {
            p3: 2
          }
        }),
        b: '$x.y'
      },
      zPlusOne: ['$x.y.z', input => input + 1]
    })

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
      expect(result).toEqual({
        x: [1, 2],
        y: {
          a: {
            p1: 1,
            p2: {
              p3: 2
            }
          },
          b: {
            z: 2
          }
        },
        zPlusOne: 3
      })
    })
  })

  it('should resolve a nested reducer object #2', () => {
    const reducer = createReducerObject(createReducer, {
      x: '$c.x',
      y: '$c.y',
      z: {
        a: '$a',
        b: '$b',
        c: constant({
          x: '$c.x',
          y: {
            y2: '$c.y'
          },
          z: ['$c.z']
        })
      }
    })

    const accumulator = AccumulatorFactory.create({
      value: {
        a: 'A',
        b: 'B',
        c: {
          x: 'X',
          y: 'Y'
        }
      }
    })

    return resolveReducerObject(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    ).then(result => {
      expect(result).toEqual({
        x: 'X',
        y: 'Y',
        z: {
          a: 'A',
          b: 'B',
          c: {
            x: '$c.x',
            y: {
              y2: '$c.y'
            },
            z: ['$c.z']
          }
        }
      })
    })
  })
  it('should move object values to different levels of nesting', () => {
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
      expect(result).toEqual({
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
