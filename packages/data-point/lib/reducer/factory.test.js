/* eslint-env jest */
'use strict'

const Factory = require('./factory')

const ReducerPath = require('../reducer-path')
const ReducerFunction = require('../reducer-function')
const ReducerEntity = require('../reducer-entity')
const createTransform = require('../transform-expression/factory').create
// TODO add reducerMap test
describe('reducer#create', () => {
  test('create path', () => {
    const reducer = Factory.create(createTransform, '$foo.bar[2]')
    expect(reducer.type).toBe(ReducerPath.type)
    expect(reducer.name).toBe('foo.bar[2]')
  })

  test('create function', () => {
    const reducer = Factory.create(createTransform, () => true)
    expect(reducer.type).toBe(ReducerFunction.type)
    expect(reducer.body.length).toBe(0)
  })

  test('create entity', () => {
    const reducer = Factory.create(createTransform, 'fooEntity:foo.bar')
    expect(reducer.type).toBe(ReducerEntity.type)
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.entityType).toBe('fooEntity')
  })

  test(' detect invalid', () => {
    expect(() => {
      Factory.create(createTransform, 'a')
    }).toThrowErrorMatchingSnapshot()
  })
})
