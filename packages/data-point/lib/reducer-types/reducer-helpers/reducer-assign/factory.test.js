/* eslint-env jest */

const Factory = require('./factory')
const createReducer = require('../../index').create

describe('ReducerAssign#factory', () => {
  test('It should create a ReducerAssign object', () => {
    const reducer = Factory.create(createReducer, {})
    expect(reducer).toBeInstanceOf(Factory.Constructor)
    expect(reducer.type).toBe(Factory.type)
    expect(reducer.reducer).toHaveProperty('type', 'ReducerObject')
  })
})
