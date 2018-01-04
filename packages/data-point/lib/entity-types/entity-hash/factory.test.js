/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('factory#create default', () => {
  const result = factory.create({})

  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('before')
  expect(result).not.toHaveProperty('after')
  expect(result).not.toHaveProperty('value')
  expect(result.params).toEqual({})

  expect(result.compose).toBeInstanceOf(Array)
})

describe('factory#parse loose modifiers', () => {
  test('factory#mapKeys', () => {
    const result = factory.create({
      mapKeys: {
        a: '$a'
      }
    })

    expect(result.compose[0]).toHaveProperty('type', 'mapKeys')
    expect(result.compose[0].reducer).toHaveProperty('type', 'ReducerObject')
  })
  test('factory#addKeys', () => {
    const result = factory.create({
      addKeys: {
        a: '$a'
      }
    })

    expect(result.compose[0]).toHaveProperty('type', 'addKeys')
    expect(result.compose[0].reducer).toHaveProperty('type', 'ReducerObject')
  })
  test('factory#omitKeys', () => {
    const result = factory.create({
      omitKeys: ['a']
    })

    expect(result.compose[0]).toHaveProperty('type', 'omitKeys')
    expect(result.compose[0].reducer).toEqual(['a'])
  })
  test('factory#pickKeys', () => {
    const result = factory.create({
      pickKeys: ['a']
    })

    expect(result.compose[0]).toHaveProperty('type', 'pickKeys')
    expect(result.compose[0].reducer).toEqual(['a'])
  })
})

describe('factory#parse composed modifiers', () => {
  test('throw error if compose non array', () => {
    const spec = {
      id: 'hash:invalid',
      compose: {}
    }
    expect(() => {
      factory.create(spec)
    }).toThrow()
  })
  test('throw error if compose and loose modifiers are mixed', () => {
    const spec = {
      id: 'hash:invalid',
      mapKeys: {},
      compose: [
        {
          mapKeys: {}
        }
      ]
    }
    expect(() => {
      factory.create(spec)
    }).toThrow()
  })
  test('throw error if modifier is invalid', () => {
    const spec = {
      id: 'hash:invalid',
      compose: [
        {
          invalidKey: {}
        }
      ]
    }
    expect(() => {
      factory.create(spec)
    }).toThrow()
  })
  test('factory#one modifier', () => {
    const result = factory.create({
      compose: [
        {
          mapKeys: {
            a: '$a'
          }
        }
      ]
    })

    expect(result.compose[0]).toHaveProperty('type', 'mapKeys')
    expect(result.compose[0].reducer).toHaveProperty('type', 'ReducerObject')
  })
  test('factory#multiple modifiers', () => {
    const result = factory.create({
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

    expect(result.compose[0]).toHaveProperty('type', 'addKeys')
    expect(result.compose[0].reducer).toHaveProperty('type', 'ReducerObject')
    expect(result.compose[0].reducer.props[0].path).toEqual(['a'])
    expect(result.compose[0].reducer.props[0].reducer).toHaveProperty(
      'type',
      'ReducerPath'
    )
    expect(result.compose[1]).toHaveProperty('type', 'mapKeys')
    expect(result.compose[1].reducer).toHaveProperty('type', 'ReducerObject')
    expect(result.compose[1].reducer.props[0].path).toEqual(['a'])
    expect(result.compose[1].reducer.props[0].reducer).toHaveProperty(
      'type',
      'ReducerPath'
    )
    expect(result.compose[2]).toHaveProperty('type', 'omitKeys')
    expect(result.compose[2].reducer).toEqual(['a'])
  })
})
