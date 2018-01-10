/* eslint-env jest */

const Factory = require('./reducer-stub')

describe('ReducerStub#factory', () => {
  test('It should create a ReducerStub object', () => {
    const reducer = Factory.create('ReducerPick', '$a', '$b')
    expect(reducer).toBeInstanceOf(Factory.ReducerStub)
    expect(Factory.isType(reducer)).toBe(true)
    expect(Factory.isType({ type: 'ReducerStub' })).toBe(false)
    expect(reducer[Factory.REDUCER_STUB_SYMBOL]).toBe(true)
    expect(reducer.type).toBe('ReducerPick')
    expect(reducer.args).toEqual(['$a', '$b'])
  })
})
