/* eslint-env jest */

const Factory = require('./factory')

describe('validateResolve', () => {
  it('should throw error if type is not function', () => {
    expect(() => {
      Factory.validateResolve('string')
    }).toThrowErrorMatchingSnapshot()
  })
  it('should throw error if function does not match arity', () => {
    expect(() => {
      Factory.validateResolve(a => {})
    }).toThrowErrorMatchingSnapshot()
  })
  it('should return true if validation has no errors', () => {
    const resolver = (a, b) => {}
    expect(Factory.validateResolve(resolver)).toEqual(true)
  })
})

describe('validateFactory', () => {
  it('should throw error if type is not function', () => {
    expect(() => {
      Factory.validateFactory('string')
    }).toThrowErrorMatchingSnapshot()
  })
  it('should throw error if function does not match arity', () => {
    expect(() => {
      Factory.validateFactory(a => {})
    }).toThrowErrorMatchingSnapshot()
  })
  it('should return true if validation has no errors', () => {
    const resolver = (a, b) => {}
    expect(Factory.validateFactory(resolver)).toEqual(true)
  })
})

describe('Factory.createEntityType', () => {
  test('It should create entity defaults', () => {
    const resolve = (a, b) => true
    const entitySource = {
      resolve,
      before: '$',
      value: '$',
      error: '$',
      after: '$'
    }
    const entity = Factory.createEntityType('foo', 'bar', entitySource)

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

describe('createEntityInstance', () => {
  function createEntityInstance () {
    const entity = {
      id: 'foo:myFoo'
    }
    return Factory.createEntityInstance(entity)
  }
  it('should create an instance with overriden constructor name', () => {
    expect(createEntityInstance().constructor.name).toEqual('foo:myFoo')
  })
  it('should return frozen object', () => {
    expect(Object.isFrozen(createEntityInstance())).toEqual(true)
  })
})

describe('create', () => {
  const resolve = (acc, resolveReducer) => true
  const create = (name, spec) => {
    return {}
  }
  it('should throw error if arguments are wrong', () => {
    expect(() => {
      Factory.create()
    }).toThrowErrorMatchingSnapshot()
  })
  it('should throw error if type argument is not string', () => {
    expect(() => {
      Factory.create(true, true, true)
    }).toThrowErrorMatchingSnapshot()
  })
  it('should create Entity Factory', () => {
    const BarFactory = Factory.create('bar', create, resolve)
    expect(BarFactory).toBeInstanceOf(Function)
    expect(BarFactory.length).toEqual(2)
  })
  it('should create new entity instance', () => {
    const BarFactory = Factory.create('bar', create, resolve)
    const entity = BarFactory('foo', {})
    expect(entity).toMatchSnapshot()
  })
  it('should create new entity instance with generic name', () => {
    const BarFactory = Factory.create('bar', create, resolve)
    const entity = BarFactory({})
    expect(entity).toMatchSnapshot()
    expect(entity.resolve).toEqual(resolve)
  })
  it('should create new entity instance with assigned name', () => {
    const BarFactory = Factory.create('bar', create, resolve)
    const entity = BarFactory('myBar', {})
    expect(entity).toMatchSnapshot()
    expect(entity.resolve).toEqual(resolve)
  })
})
