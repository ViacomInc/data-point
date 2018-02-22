/* eslint-env jest */

const modelFactory = require('./factory')
const helpers = require('../../helpers')

test('modelFactory#create default', () => {
  const result = modelFactory.create({})
  expect(result).not.toHaveProperty('error')
  expect(result).not.toHaveProperty('before')
  expect(result).not.toHaveProperty('after')
  expect(result.params).toEqual({})

  expect(result).not.toHaveProperty('value')
  expect(result.compose).toBeUndefined()
})

describe('parse loose modifiers', () => {
  test('modelFactory#create default | checks that an entity containing one reducer has that respective property', () => {
    const result = modelFactory.create({
      map: '$a'
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerMap')
    expect(result.compose.reducer).toHaveProperty('type', 'ReducerPath')
  })
})

describe('parse compose modifier', () => {
  test('parses from compose property', () => {
    const result = modelFactory.create({
      compose: [{ map: '$a' }]
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerMap')
    expect(result.compose.reducer).toHaveProperty('type', 'ReducerPath')
  })

  test('throw error if compose is not an array', () => {
    expect(() => {
      modelFactory.create(
        {
          compose: { map: '$a' }
        },
        'test-id'
      )
    }).toThrowErrorMatchingSnapshot()
  })

  test('throw error if compose is mixed with inline modifiers (map, filter, ..) ', () => {
    expect(() => {
      modelFactory.create(
        {
          compose: [{ map: '$a' }],
          map: '$a',
          filter: '$a'
        },
        'test-id'
      )
    }).toThrowErrorMatchingSnapshot()
  })

  test('parses multiple modifiers, respect order', () => {
    const result = modelFactory.create({
      compose: [{ map: '$a' }, { find: '$a' }, { filter: '$a' }]
    })

    expect(helpers.isReducer(result.compose)).toBe(true)
    expect(result.compose).toHaveProperty('type', 'ReducerList')
    expect(result.compose.reducers[0]).toHaveProperty('type', 'ReducerMap')
    expect(result.compose.reducers[1]).toHaveProperty('type', 'ReducerFind')
    expect(result.compose.reducers[2]).toHaveProperty('type', 'ReducerFilter')
  })
})
