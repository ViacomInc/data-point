/* eslint-env jest */

const _ = require('lodash')
const TransformKeys = require('./transform-keys')

describe('getTransformKeys', () => {
  const testData = {
    a: 1,
    b: [
      2,
      {
        a: 2,
        b: {
          $a1: 'a1'
        }
      }
    ],
    $a2: 'a2',
    c: {
      d: {
        f: [
          {
            $a3: 'a3'
          }
        ]
      }
    }
  }
  let result
  beforeAll(() => {
    result = TransformKeys.getTransformKeys(testData)
  })
  test('It should return array', () => {
    expect(result).toBeInstanceOf(Array)
  })
  test('It should extract all keys marked as transforms', () => {
    expect(result).toHaveLength(3)
  })
  test('Each result should have path and value', () => {
    expect(result[0]).toHaveProperty('path', ['b', 1, 'b', 'a1'])
    expect(result[0]).toHaveProperty('value', 'a1')
  })
  test('transform key should have $ removed from it', () => {
    expect(_.last(result[0].path)).toEqual('a1')
  })
})
