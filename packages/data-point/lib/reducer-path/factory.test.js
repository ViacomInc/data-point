/* eslint-env jest */
'use strict'

const factory = require('./factory')

it('reducer/reducer-path#isPath', () => {
  expect(factory.isPath('#a')).not.toBe('is not path')
  expect(factory.isPath('$.')).toBeTruthy()
})

describe('reducer/reducer-path#create', () => {
  it('basic path', () => {
    const reducer = factory.create('$a')
    expect(reducer.type).toBe('ReducerPath')
    expect(reducer.name).toBe('a')
  })

  it('compound path', () => {
    const reducer = factory.create('$foo.bar')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(false)
  })

  it('compound path', () => {
    const reducer = factory.create('$foo.bar[0]')
    expect(reducer.name).toBe('foo.bar[0]')
    expect(reducer.asCollection).toBe(false)
  })

  it('path with asCollection', () => {
    const reducer = factory.create('$foo.bar[]')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(true)
  })
})
