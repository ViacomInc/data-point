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
    expect(reducer.castAs).toBe('*')
  })

  it('path with casting type', () => {
    const reducer = factory.create('$a:boolean')
    expect(reducer.name).toBe('a')
    expect(reducer.castAs).toBe('boolean')
  })

  it('path with casting type', () => {
    const reducer = factory.create('$a:foo.bar')
    expect(reducer.name).toBe('a')
    expect(reducer.castAs).toBe('foo.bar')
  })
})
