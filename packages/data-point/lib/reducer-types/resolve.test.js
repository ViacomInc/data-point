/* eslint-env jest */

const Factory = require('./factory')
const Resolve = require('./resolve')

const reducers = require('../../test/utils/reducers')

const fixtureStore = require('../../test/utils/fixture-store')
const testData = require('../../test/data.json')

const AccumulatorFactory = require('../accumulator/factory')

let manager

beforeAll(() => {
  manager = fixtureStore.create()
})

function resolve (source, options, value) {
  const reducer = Factory.create(source, options)
  const accumulator = AccumulatorFactory.create({ value })
  return Resolve.resolve(manager, accumulator, reducer).catch(e => e)
}

describe('reducer#resolve', () => {
  test('It should work for valid input', () => {
    const source = reducers.addCollectionValues()
    const value = testData.a.b.c
    const options = {}
    return resolve(source, options, value).then(result => {
      expect(result).toEqual(6)
    })
  })

  test('It should throw error for invalid input', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.a.b.c
    })

    const reducer = { type: 'INVALID TYPE' }
    expect(() => {
      Resolve.resolve(manager, accumulator, reducer)
    }).toThrowErrorMatchingSnapshot()
  })

  test('It should return undefined when no default is provided', () => {
    const source = '$a'
    const value = { a: undefined }
    const options = {}
    return resolve(source, options, value).then(result => {
      expect(result).toBeUndefined()
    })
  })
})

describe('reducer#resolve with default value', () => {
  test('do not overwrite false', () => {
    const source = '$a'
    const value = { a: false }
    const options = { default: 500 }
    return resolve(source, options, value).then(result => {
      expect(result).toBe(false)
    })
  })
  test('do not overwrite true', () => {
    const source = '$a'
    const value = { a: true }
    const options = { default: 500 }
    return resolve(source, options, value).then(result => {
      expect(result).toBe(true)
    })
  })
  test('overwrite undefined', () => {
    const source = '$a'
    const value = { a: undefined }
    const options = { default: 500 }
    return resolve(source, options, value).then(result => {
      expect(result).toBe(500)
    })
  })
  test('overwrite undefined with function as default', () => {
    const source = '$a'
    const value = { a: undefined }
    const options = { default: () => 500 }
    return resolve(source, options, value).then(result => {
      expect(result).toBe(500)
    })
  })
})
