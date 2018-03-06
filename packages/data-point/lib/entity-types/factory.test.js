/* eslint-env jest */

const { createEntityFactory } = require('./factory')

// TODO have a test that actually creates an entity with the result from createEntityFactory

describe('entity-types/factory#createEntityFactory', () => {
  test('should create an entity factory that returns an object with the expected shape', () => {
    const factory = createEntityFactory('Hash')
    expect(factory('nuts', {})).toMatchSnapshot()
  })
})
