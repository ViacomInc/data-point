/* eslint-env jest */

const helpers = require('./helpers')

describe('helpers API', () => {
  test('check what methods are exported in the helpers modules', () => {
    expect(helpers).toMatchSnapshot()
  })
})
