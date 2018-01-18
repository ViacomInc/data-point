/* eslint-env jest */

const Factory = require('./factory')

const ReducerPath = require('./reducer-path')
const ReducerFunction = require('./reducer-function')
const ReducerObject = require('./reducer-object')
const ReducerEntity = require('./reducer-entity')
const stubFactories = require('./reducer-helpers').stubFactories

describe('reducer#create', () => {
  test('create path', () => {
    const reducer = Factory.create('$foo.bar[2]')
    expect(reducer.type).toBe(ReducerPath.type)
    expect(reducer.name).toBe('foo.bar[2]')
  })

  test('create function', () => {
    const reducer = Factory.create(() => true)
    expect(reducer.type).toBe(ReducerFunction.type)
    expect(reducer.body).toHaveLength(0)
  })

  test('create object', () => {
    const reducer = Factory.create({})
    expect(reducer.type).toBe(ReducerObject.type)
    expect(reducer.props).toHaveLength(0)
  })

  test('create entity', () => {
    const reducer = Factory.create('fooEntity:foo.bar')
    expect(reducer.type).toBe(ReducerEntity.type)
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.entityType).toBe('fooEntity')
  })

  test('detect invalid', () => {
    expect(() => {
      Factory.create('a')
    }).toThrowErrorMatchingSnapshot()

    expect(() => {
      Factory.create(true)
    }).toThrowErrorMatchingSnapshot()

    expect(() => {
      Factory.create(1)
    }).toThrowErrorMatchingSnapshot()
  })
})

describe('reducer#isReducer', () => {
  function testIsReducer (source) {
    return Factory.isReducer(Factory.create(source))
  }

  test('It should return true for reducers', () => {
    expect(Factory.isReducer()).toBe(false)
    expect(Factory.isReducer({})).toBe(false)
    expect(Factory.isReducer([])).toBe(false)
    expect(testIsReducer('entry:test')).toBe(true)
    expect(testIsReducer(() => true)).toBe(true)
    expect(testIsReducer(['$a', '$b'])).toBe(true)
    expect(testIsReducer({ a: '$a' })).toBe(true)
    expect(testIsReducer('$a.b')).toBe(true)
    expect(testIsReducer(stubFactories.assign('$a'))).toBe(true)
    expect(testIsReducer(stubFactories.filter('$a'))).toBe(true)
    expect(testIsReducer(stubFactories.find('$a'))).toBe(true)
    expect(testIsReducer(stubFactories.map('$a'))).toBe(true)
    expect(testIsReducer(stubFactories.omit('$a'))).toBe(true)
    expect(testIsReducer(stubFactories.pick('$a'))).toBe(true)
  })
})
