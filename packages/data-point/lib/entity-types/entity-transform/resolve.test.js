/* eslint-env jest */

const resolveTransformEntity = require('./resolve').resolve

describe('resolve', () => {
  test('should return acc as is', () => {
    return expect(resolveTransformEntity(1)).toEqual(1)
  })
})
