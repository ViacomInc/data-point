/* eslint-env jest */
const parseCompose = require('./parse-compose')
const _ = require('lodash')

function expectModifier (result) {
  expect(result).toHaveProperty('type')
  expect(result).toHaveProperty('spec')
}

describe('createComposeReducer', () => {
  test('creates ModifierObject', () => {
    const result = parseCompose.createComposeReducer('map', '$a')
    expectModifier(result)
  })
})

describe('parseModifierSpec', () => {
  test('parses a modifier spec | and contains only one key', () => {
    const result = parseCompose.parseModifierSpec({
      map: '$a'
    })
    expectModifier(result)
  })
})

describe('parseComposeSpecProperty', () => {
  test('parses a modifier spec | and can contain array of keys', () => {
    const result = parseCompose.parseComposeSpecProperty([
      {
        map: '$a'
      }
    ])

    expect(result).toHaveLength(1)
    result.forEach(expectModifier)
  })
  test('should throw error if does not contain keys', () => {
    expect(() => {
      parseCompose.parseComposeSpecProperty([{}])
    }).toThrow(/found 0/)
  })
  test('should throw error if contains more than 1 key', () => {
    expect(() => {
      parseCompose.parseComposeSpecProperty([
        {
          map: '$a',
          filter: '$a'
        }
      ])
    }).toThrow(/found 2/)
  })
})

describe('parseComposeFromEntitySpec', () => {
  test('should parse modifiers from entitySpec keys', () => {
    const result = parseCompose.parseComposeFromEntitySpec(
      {
        shouldIgnore: '$a',
        map: '$a',
        filter: '$a'
      },
      ['filter', 'map']
    )

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    result.forEach(expectModifier)
    expect(_.map(result, 'type')).toEqual(['filter', 'map'])
  })
})
