/* eslint-env jest */

const { allowedProperties, allowedModifiers } = require('./allowed-modifiers')

describe('allowedProperties', () => {
  test('It should throw error if keys dont match', () => {
    expect(() => {
      const spec = {
        foo: true
      }
      allowedProperties('foo:test', spec, ['bar'])
    }).toThrowErrorMatchingSnapshot()

    expect(() => {
      const spec = {
        bar: true,
        foo: true
      }
      allowedProperties('foo:test', spec, ['bar'])
    }).toThrowErrorMatchingSnapshot()
  })

  test('It should do nothing if using all valid keys', () => {
    let spec = {
      bar: true
    }
    expect(allowedProperties('foo:test', spec, ['bar'])).toBeTruthy()

    spec = {}
    expect(allowedProperties('foo:test', spec, ['bar'])).toBeTruthy()
  })
})

describe('allowedModifiers', () => {
  test('It should include base modifiers', () => {
    expect(() => {
      const spec = {
        inputType: true,
        outputType: true,
        before: true,
        after: true,
        error: true,
        value: true,
        foo: true
      }
      allowedModifiers('foo:test', spec, ['bar'])
    }).toThrowErrorMatchingSnapshot()
  })
})
