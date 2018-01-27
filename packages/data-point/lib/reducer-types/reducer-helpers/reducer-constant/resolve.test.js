/* eslint-env jest */

const DataPoint = require('../../../index')
const constant = DataPoint.helpers.constant

const dataPoint = DataPoint.create()

describe('ReducerConstant#resolve', () => {
  test('constant with nested object', () => {
    const source = {
      a: '$a',
      b: 1,
      c: {
        a: '$c.a'
      }
    }
    const input = {}

    return dataPoint
      .transform(constant(source), input)
      .then(result => expect(result.value).toEqual(source))
  })

  test('constant with a function', () => {
    const source = acc => {
      throw new Error()
    }
    const input = 1

    return dataPoint
      .transform(constant(source), input)
      .catch(e => e)
      .then(result => {
        expect(result).not.toBeInstanceOf(Error)
        expect(result.value).toEqual(source)
        expect(() => result.value()).toThrow()
      })
  })

  test('constants inside of a ReducerObject', () => {
    const source = {
      a: '$a',
      b: '$b',
      c: constant({
        a: '$c.a'
      }),
      d: constant(1)
    }
    const input = {
      a: 1,
      b: 2,
      c: {
        a: 1
      }
    }

    return dataPoint.transform(source, input).then(result =>
      expect(result.value).toEqual({
        a: 1,
        b: 2,
        c: {
          a: '$c.a'
        },
        d: 1
      })
    )
  })
})
