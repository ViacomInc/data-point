/* eslint-env jest */
const parseCompose = require('./parse-compose')

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
  test('it should parse a modifier spec', () => {
    const result = parseCompose.parseModifierSpec('id', ['map'], {
      map: '$a'
    })
    expectModifier(result)
  })
})

describe('parseComposeSpec', () => {
  test('it should parse a single modifier spec', () => {
    const result = parseCompose.parseComposeSpec(
      'id',
      ['map'],
      [
        {
          map: '$a'
        }
      ]
    )

    expect(result).toHaveLength(1)
    result.forEach(expectModifier)
  })

  test('should throw error if does not contain keys', () => {
    expect(() => {
      parseCompose.parseComposeSpec('id', [], [{}])
    }).toThrowErrorMatchingSnapshot()
  })

  test('should throw error if contains more than 1 key', () => {
    expect(() => {
      parseCompose.parseComposeSpec(
        'id',
        ['map', 'filter'],
        [
          {
            map: '$a',
            filter: '$a'
          }
        ]
      )
    }).toThrowErrorMatchingSnapshot()
  })
})

describe('parse', () => {
  test('should parse a single key', () => {
    return expect(
      parseCompose.parse('id', ['map'], {
        map: '$a'
      })
    ).toMatchSnapshot()
  })

  test('should parse multiple keys inside of compose', () => {
    return expect(
      parseCompose.parse('id', ['map', 'find'], {
        compose: [
          {
            map: '$a'
          },
          {
            find: '$b'
          }
        ]
      })
    ).toMatchSnapshot()
  })

  test('should throw error for invalid key inside compose', () => {
    return expect(() =>
      parseCompose.parse('id', ['map'], {
        compose: [
          {
            find: '$a'
          }
        ]
      })
    ).toThrowErrorMatchingSnapshot()
  })

  test('should throw error when multiple keys are not inside compose', () => {
    return expect(() =>
      parseCompose.parse('id', ['map', 'find'], {
        map: '$a',
        find: '$a'
      })
    ).toThrowErrorMatchingSnapshot()
  })

  test('should throw error when the compose key and individual modifier keys are used together', () => {
    return expect(() =>
      parseCompose.parse('id', ['map', 'find'], {
        map: '$a',
        compose: [
          {
            find: '$a'
          }
        ]
      })
    ).toThrowErrorMatchingSnapshot()
  })
})
