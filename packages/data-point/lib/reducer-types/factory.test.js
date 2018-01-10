/* eslint-env jest */

const Factory = require('./factory')

const ReducerPath = require('./reducer-path')
const ReducerFunction = require('./reducer-function')
const ReducerObject = require('./reducer-object')
const ReducerEntity = require('./reducer-entity')

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
