/* eslint-env jest */

const Factory = require('./factory')
const createReducer = require('../../index').create

describe('ReducerPick#factory', () => {
  test('It should create a ReducerPick object', () => {
    const args = ['$a', '$b']
    const reducer = Factory.create(createReducer, args)
    expect(reducer).toBeInstanceOf(Factory.ReducerPick)
    expect(reducer.type).toBe(Factory.type)
    expect(reducer.keys).toEqual(args)
  })
})
