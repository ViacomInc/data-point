/* eslint-env jest */
'use strict'

const _ = require('lodash')
const factory = require('./factory')
const createReducer = require('../reducer').create

describe('factory#create', () => {
  test('factory#create default', () => {
    const result = factory.create(createReducer)

    expect(result).toBeInstanceOf(factory.ReducerList)
    expect(result.context).toBeUndefined()
    expect(result.reducers).toHaveLength(0)
  })

  test('factory#create only path', () => {
    const result = factory.create(createReducer, '$foo.bar')
    expect(result.reducers).toHaveLength(1)

    const reducer = _.first(result.reducers)
    expect(reducer.type).toBe('ReducerPath')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(false)
  })

  test('factory#create path as collection', () => {
    const result = factory.create(createReducer, '$foo.bar[]')
    expect(result.reducers).toHaveLength(1)

    const reducer = _.first(result.reducers)
    expect(reducer.type).toBe('ReducerPath')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(true)
  })

  test('factory#create context with reducers', () => {
    const result = factory.create(createReducer, [
      '$foo.bar | reducer:add',
      () => true
    ])

    expect(result.reducers).toHaveLength(3)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerEntity')
    expect(result.reducers[2].type).toBe('ReducerFunction')
  })

  test('factory#create context with reducers', () => {
    const result = factory.create(createReducer, [
      '$foo.bar',
      'reducer:add',
      () => true
    ])

    expect(result.reducers).toHaveLength(3)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerEntity')
    expect(result.reducers[2].type).toBe('ReducerFunction')
  })
})

describe('factory#create', () => {
  test('factory#create transfrom empty array', () => {
    const result = factory.create(createReducer, [])
    expect(result.reducers).toHaveLength(0)
  })

  test('factory#create transfrom with single function', () => {
    const result = factory.create(createReducer, (acc, done) =>
      done(null, acc.value)
    )
    expect(result.reducers).toHaveLength(1)
    expect(result.reducers[0].type).toBe('ReducerFunction')
  })

  test('factory#create transfrom with string', () => {
    const result = factory.create(createReducer, ['$foo', '$bar'])
    expect(result.reducers).toHaveLength(2)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerPath')
  })

  test('factory#create transfrom with grouped reducers and single reducers', () => {
    const result = factory.create(createReducer, ['$foo | $bar', '$baz'])
    expect(result.reducers).toHaveLength(3)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerPath')
    expect(result.reducers[2].type).toBe('ReducerPath')
  })

  test('factory#create errors if invalid reducer type', () => {
    const result = _.attempt(factory.create, createReducer, 1)

    expect(result).toBeInstanceOf(Error)
  })

  test('factory#create transfrom from array', () => {
    const result = factory.create(createReducer, [
      '$foo.bar',
      'reducer:add | $foo.bar.zeta',
      (acc, done) => done(null, acc.value)
    ])

    expect(result.reducers).toHaveLength(4)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerEntity')
    expect(result.reducers[2].type).toBe('ReducerPath')
    expect(result.reducers[3].type).toBe('ReducerFunction')
  })
})
