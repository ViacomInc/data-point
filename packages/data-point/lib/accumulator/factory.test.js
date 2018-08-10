/* eslint-env jest */

const Factory = require('./factory')

describe('Accumulator', () => {
  it('should create base accumulator object', () => {
    expect(new Factory.Accumulator()).toMatchSnapshot()
  })
})
