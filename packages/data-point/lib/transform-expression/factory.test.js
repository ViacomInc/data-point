/* eslint-env jest */
'use strict'

const _ = require('lodash')
const TransformFactory = require('./factory')

describe('TransformFactory#create', () => {
  test('TransformFactory#create default', () => {
    const result = TransformFactory.create()

    expect(result).toBeInstanceOf(TransformFactory.TransformExpression)
    expect(result.context).toBeUndefined()
    expect(result.reducers).toHaveLength(0)
  })

  test('TransformFactory#create only path', () => {
    const result = TransformFactory.create('$foo.bar')
    expect(result.reducers).toHaveLength(1)

    const reducer = _.first(result.reducers)
    expect(reducer.type).toBe('ReducerPath')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(false)
  })

  test('TransformFactory#create path as collection', () => {
    const result = TransformFactory.create('$foo.bar[]')
    expect(result.reducers).toHaveLength(1)

    const reducer = _.first(result.reducers)
    expect(reducer.type).toBe('ReducerPath')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(true)
  })

  test('TransformFactory#create context with reducers', () => {
    const result = TransformFactory.create([
      '$foo.bar | reducer:add',
      () => true
    ])

    expect(result.reducers).toHaveLength(3)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerEntity')
    expect(result.reducers[2].type).toBe('ReducerFunction')
  })

  test('TransformFactory#create context with reducers', () => {
    const result = TransformFactory.create([
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

describe('TransformFactory#create', () => {
  test('TransformFactory#create transfrom empty array', () => {
    const result = TransformFactory.create([])
    expect(result.reducers).toHaveLength(0)
  })

  test('TransformFactory#create transfrom with single function', () => {
    const result = TransformFactory.create((acc, done) => done(null, acc.value))
    expect(result.reducers).toHaveLength(1)
    expect(result.reducers[0].type).toBe('ReducerFunction')
  })

  test('TransformFactory#create transfrom with string', () => {
    const result = TransformFactory.create(['$foo', '$bar'])
    expect(result.reducers).toHaveLength(2)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerPath')
  })

  test('TransformFactory#create transfrom with grouped reducers and single reducers', () => {
    const result = TransformFactory.create(['$foo | $bar', '$baz'])
    expect(result.reducers).toHaveLength(3)
    expect(result.reducers[0].type).toBe('ReducerPath')
    expect(result.reducers[1].type).toBe('ReducerPath')
    expect(result.reducers[2].type).toBe('ReducerPath')
  })

  test('TransformFactory#create errors if invalid reducer type', () => {
    const result = _.attempt(TransformFactory.create, 1)

    expect(result).toBeInstanceOf(Error)
  })

  test('TransformFactory#create transfrom from array', () => {
    const result = TransformFactory.create([
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
