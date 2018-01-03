/* eslint-env jest */
'use strict'

const factory = require('./factory')

const ReducerPath = require('../reducer-path')
const ReducerFunction = require('../reducer-function')
const ReducerObject = require('../reducer-object')
const ReducerEntity = require('../reducer-entity')

describe('reducer#create', () => {
  test('create path', () => {
    const reducer = factory.create('$foo.bar[2]')
    expect(reducer.type).toBe(ReducerPath.type)
    expect(reducer.name).toBe('foo.bar[2]')
  })

  test('create function', () => {
    const reducer = factory.create(() => true)
    expect(reducer.type).toBe(ReducerFunction.type)
    expect(reducer.body).toHaveLength(0)
  })

  test('create object', () => {
    const reducer = factory.create({})
    expect(reducer.type).toBe(ReducerObject.type)
    expect(reducer.props).toHaveLength(0)
  })

  test('create entity', () => {
    const reducer = factory.create('fooEntity:foo.bar')
    expect(reducer.type).toBe(ReducerEntity.type)
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.entityType).toBe('fooEntity')
  })

  test('detect invalid', () => {
    expect(() => {
      factory.create('a')
    }).toThrowErrorMatchingSnapshot()

    expect(() => {
      factory.create(true)
    }).toThrowErrorMatchingSnapshot()

    expect(() => {
      factory.create(1)
    }).toThrowErrorMatchingSnapshot()
  })
})
