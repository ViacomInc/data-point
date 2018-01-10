/* eslint-env jest */

const factory = require('./factory')

const EntityEntry = require('../entity-entry')

describe('reducer/reducer-entity#create', () => {
  const stub = () => {}
  test('throw if create is missing', () => {
    expect(() => {
      factory.create({}, 'entry:abc')
    }).toThrow()
  })
  test('throw if resolve is missing', () => {
    expect(() => {
      factory.create({ create: stub }, 'entry:abc')
    }).toThrow()
  })
  test('throw if resolve has wrong arity', () => {
    expect(() => {
      factory.create({ create: stub, resolve: stub }, 'entry:abc')
    }).toThrow()
  })
  test('entry', () => {
    const reducer = factory.create(EntityEntry, 'entry:abc')
    expect(reducer.id).toBe('entry:abc')
  })
})
