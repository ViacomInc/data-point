/* eslint-env jest */

const lib = require('./index')

describe('lib', () => {
  // this test here is mainly to be aware of any new method that gets added
  // to the main API
  test('It should explicity expose set of methods', () => {
    expect(lib).toMatchSnapshot()
  })
})
