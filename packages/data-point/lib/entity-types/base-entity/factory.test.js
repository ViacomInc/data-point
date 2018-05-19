/* eslint-env jest */

const Factory = require('./factory')

describe('validateResolve', () => {
  const entity = {
    id: 'foo:bar'
  }
  it('should throw error if type is not function', () => {
    expect(() => {
      Factory.validateResolve(entity, 'string')
    }).toThrowErrorMatchingSnapshot()
  })
  it('should throw error if function does not match arity', () => {
    expect(() => {
      Factory.validateResolve(entity, a => {})
    }).toThrowErrorMatchingSnapshot()
  })
  it('should resolve resolve method if no errors found', () => {
    const resolver = (a, b) => {}
    expect(Factory.validateResolve(entity, resolver)).toEqual(resolver)
  })
})

describe('Factory.createEntityType', () => {
  test('It should create entity defaults', () => {
    const resolve = (a, b) => true
    const entityType = {
      resolve,
      before: '$',
      value: '$',
      error: '$',
      after: '$'
    }
    const entity = Factory.createEntityType('foo', 'bar', entityType)

    expect(entity).toHaveProperty('isEntityInstance', true)
    expect(entity).toHaveProperty('id', 'foo:bar')
    expect(entity).toHaveProperty('name', 'bar')
    expect(entity).toHaveProperty('resolve', resolve)
    expect(entity).toHaveProperty('value.type', 'ReducerPath')
    expect(entity).toHaveProperty('error.type', 'ReducerPath')
    expect(entity).toHaveProperty('after.type', 'ReducerPath')
    expect(entity).toHaveProperty('params', {})
  })
})

describe('EntityFactory', () => {
  const resolve = (a, b) => true
  const create = () => {
    return { resolve }
  }
  it('should create Entity Factory', () => {
    const BarFactory = Factory.create('bar', create)
    expect(BarFactory).toBeInstanceOf(Function)
    expect(BarFactory.length).toEqual(2)
  })
  it('should create new entity instance', () => {
    const BarFactory = Factory.create('bar', create)
    const entity = BarFactory('foo', {})
    expect(entity).toMatchSnapshot()
  })
  it('should create new entity instance with generic name', () => {
    const BarFactory = Factory.create('bar', create)
    const entity = BarFactory({})
    expect(entity).toMatchSnapshot()
  })
})
