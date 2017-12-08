/* eslint-env jest */
'use strict'

const Factory = require('./factory')

const ReducerPath = require('../reducer-path')
const ReducerFunction = require('../reducer-function')
const ReducerEntity = require('../reducer-entity')

describe('reducer#create', () => {
  test('create path', () => {
    const reducer = Factory.create('$foo.bar[2]:int')
    expect(reducer.type).toBe(ReducerPath.type)
    expect(reducer.name).toBe('foo.bar[2]')
    expect(reducer.castAs).toBe('int')
  })

  test('create function', () => {
    const reducer = Factory.create('foo.bar(1,true)')
    expect(reducer.type).toBe(ReducerFunction.type)
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.parameters).toHaveLength(2)
  })

  test('create entity', () => {
    const reducer = Factory.create('fooEntity:foo.bar')
    expect(reducer.type).toBe(ReducerEntity.type)
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.entityType).toBe('fooEntity')
  })

  test(' detect invalid', () => {
    expect(() => {
      Factory.create('a')
    }).toThrowErrorMatchingSnapshot()
  })
})
