/* eslint-env jest */

const Factory = require('./factory')
const createReducer = require('../../index').create

describe('ReducerFind#factory', () => {
  test('It should create a ReducerFind object', () => {
    const reducer = Factory.create(createReducer, {})
    expect(reducer).toBeInstanceOf(Factory.Constructor)
    expect(reducer.type).toBe(Factory.type)
    expect(reducer.reducer).toHaveProperty('type', 'ReducerObject')
  })
})
