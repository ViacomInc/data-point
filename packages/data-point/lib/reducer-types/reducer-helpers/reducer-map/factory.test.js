/* eslint-env jest */
'use strict'

const Factory = require('./factory')
const createReducer = require('../../index').create

describe('ReducerMap#factory', () => {
  test('It should create a ReducerMap object', () => {
    const reducer = Factory.create(createReducer, {})
    expect(reducer).toBeInstanceOf(Factory.ReducerMap)
    expect(reducer.type).toBe(Factory.type)
    expect(reducer.reducer).toHaveProperty('type', 'ReducerObject')
  })
})
