/* eslint-env jest */

const Resolve = require('./resolve')

describe('Model.resolve', () => {
  test('Entry#resolve - resolve empty', () => {
    return expect(Resolve.resolve({ value: 1 })).toEqual(1)
  })
})
