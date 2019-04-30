/* eslint-env jest */

const factory = require('./factory')
const helpers = require('../../helpers')

test('factory#create default', () => {
  const result = factory.create('name', {})

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('before')
  expect(result).not.toHaveProperty('after')
  expect(result).not.toHaveProperty('value')
  expect(result.params).toEqual({})
  expect(result.compose).toBeUndefined()
})

describe('factory#parse loose modifiers', () => {
  test('factory#mapKeys', () => {
    const result = factory.create('name', {
      mapKeys: {
        a: '$a'
      }
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerObject')
  })

  test('factory#addKeys', () => {
    const result = factory.create('name', {
      addKeys: {
        a: '$a'
      }
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerAssign')
  })

  test('factory#omitKeys', () => {
    const result = factory.create('name', {
      omitKeys: ['a']
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerOmit')
    expect(result.compose.keys).toEqual(['a'])
  })

  test('factory#pickKeys', () => {
    const result = factory.create('name', {
      pickKeys: ['a']
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerPick')
    expect(result.compose.keys).toEqual(['a'])
  })
})

describe('factory#parse composed modifiers', () => {
  test('throw error if compose non array', () => {
    const spec = {
      compose: {}
    }
    expect(() => {
      factory.create('hash:invalid', spec)
    }).toThrowErrorMatchingSnapshot()
  })

  test('throw error if compose and loose modifiers are mixed', () => {
    const spec = {
      mapKeys: {},
      compose: [
        {
          mapKeys: {}
        }
      ]
    }
    expect(() => {
      factory.create('hash:invalid', spec)
    }).toThrowErrorMatchingSnapshot()
  })

  test('throw error if modifier is invalid', () => {
    const spec = {
      compose: [
        {
          invalidKey: {}
        }
      ]
    }
    expect(() => {
      factory.create('hash:invalid', spec)
    }).toThrowErrorMatchingSnapshot()
  })

  test('factory#one modifier', () => {
    const result = factory.create('name', {
      compose: [
        {
          mapKeys: {
            a: '$a'
          }
        }
      ]
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerObject')
  })

  test('factory#multiple modifiers', () => {
    const result = factory.create('name', {
      compose: [
        {
          addKeys: {
            a: '$a'
          }
        },
        {
          mapKeys: {
            a: '$a'
          }
        },
        {
          omitKeys: ['a']
        }
      ]
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerList')

    expect(result.compose.reducers[0]).toHaveProperty('type', 'ReducerAssign')
    expect(result.compose.reducers[0].reducer).toHaveProperty(
      'type',
      'ReducerObject'
    )

    expect(result.compose.reducers[1]).toHaveProperty('type', 'ReducerObject')
    expect(result.compose.reducers[1].source()).toEqual({})
    expect(result.compose.reducers[1].reducers).toHaveLength(1)
    expect(result.compose.reducers[1].reducers[0].reducer).toHaveProperty(
      'type',
      'ReducerPath'
    )

    expect(result.compose.reducers[2]).toHaveProperty('type', 'ReducerOmit')
    expect(result.compose.reducers[2].keys).toEqual(['a'])
  })
})
