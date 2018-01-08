/* eslint-env jest */
'use strict'

const factory = require('./factory')

it('reducer/reducer-path#isType', () => {
  expect(factory.isType('#a')).not.toBe('is not path')
  expect(factory.isType('$.')).toBeTruthy()
})

describe('ReducerPath getters', () => {
  let acc
  beforeEach(() => {
    acc = {
      params: {
        a: [2, 4]
      },
      value: [
        {
          a: 2
        },
        {
          a: 4
        }
      ]
    }
  })

  it('reducer/reducer-path#getAccumulatorValue', () => {
    expect(factory.getAccumulatorValue({ value: undefined })).toBeUndefined()
    expect(factory.getAccumulatorValue(acc)).toEqual(acc.value)
  })

  it('reducer/reducer-path#getFromAccumulator', () => {
    expect(factory.getFromAccumulator('', acc)).toBeUndefined()
    expect(factory.getFromAccumulator('value', acc)).toEqual(acc.value)
    expect(factory.getFromAccumulator('params', acc)).toEqual(acc.params)
    expect(factory.getFromAccumulator('params.a', acc)).toEqual([2, 4])
    expect(factory.getFromAccumulator('params.a[1]', acc)).toBe(4)
  })

  it('reducer/reducer-path#getFromAccumulatorValue', () => {
    expect(factory.getFromAccumulatorValue('', acc)).toBeUndefined()
    expect(factory.getFromAccumulatorValue('value', acc)).toBeUndefined()
    expect(factory.getFromAccumulatorValue('[0]', acc)).toEqual(acc.value[0])
  })

  it('reducer/reducer-path#mapFromAccumulatorValue', () => {
    expect(factory.mapFromAccumulatorValue('a', { value: {} })).toBeUndefined()
    expect(factory.mapFromAccumulatorValue('a', acc)).toEqual([2, 4])
  })
})

describe('reducer/reducer-path#getPathReducerFunction', () => {
  it('should always return a function', () => {
    expect(factory.getPathReducerFunction()).toBeInstanceOf(Function)
    expect(factory.getPathReducerFunction('')).toBeInstanceOf(Function)
    expect(factory.getPathReducerFunction('.')).toBeInstanceOf(Function)
    expect(factory.getPathReducerFunction('..')).toBeInstanceOf(Function)
    expect(factory.getPathReducerFunction('..', true)).toBeInstanceOf(Function)
    expect(factory.getPathReducerFunction('a.b.c')).toBeInstanceOf(Function)
  })
})

describe('reducer/reducer-path#create', () => {
  it('basic path', () => {
    const reducer = factory.create('$a')
    expect(reducer.type).toBe('ReducerPath')
    expect(reducer.name).toBe('a')
    expect(reducer.asCollection).toBe(false)
  })

  it('empty path', () => {
    const reducer = factory.create('$')
    expect(reducer.type).toBe('ReducerPath')
    expect(reducer.name).toBe('.')
    expect(reducer.asCollection).toBe(false)
  })

  it('compound path', () => {
    const reducer = factory.create('$foo.bar')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(false)
  })

  it('compound path', () => {
    const reducer = factory.create('$foo.bar[0]')
    expect(reducer.name).toBe('foo.bar[0]')
    expect(reducer.asCollection).toBe(false)
  })

  it('path with asCollection', () => {
    const reducer = factory.create('$foo.bar[]')
    expect(reducer.name).toBe('foo.bar')
    expect(reducer.asCollection).toBe(true)
  })
})

describe('ReducerPath#body', () => {
  test('resolve "empty" jsonpath to entire value', () => {
    const acc = {
      value: 'test'
    }
    const result = factory.create('$').body(acc)
    expect(result).toBe('test')
  })

  test('resolve "$." to entire value', () => {
    const acc = {
      value: 'test'
    }
    const result = factory.create('$.').body(acc)
    expect(result).toBe('test')
  })

  test('resolve prefix ".." with valid jsonpath to resolved value', () => {
    const acc = {
      value: {
        a: ['test']
      },
      locals: 'test2'
    }
    let result = factory.create('$..value.a[0]').body(acc)
    expect(result).toBe('test')
    result = factory.create('$..locals').body(acc)
    expect(result).toBe('test2')
  })

  test('resolve valid jsonpath to resolved value', () => {
    const acc = {
      value: {
        a: ['test']
      }
    }
    const result = factory.create('$a[0]').body(acc)
    expect(result).toBe('test')
  })

  test('resolve valid collection path to resolved value', () => {
    const acc = {
      value: [
        {
          a: {
            b: {
              c: 1
            }
          }
        },
        {
          a: {
            b: {
              c: 2
            }
          }
        },
        {
          a: {
            b: {
              c: 3
            }
          }
        }
      ]
    }
    const result = factory.create('$a.b.c[]').body(acc)
    expect(result).toEqual([1, 2, 3])
  })

  test('resolve invalid collection path key to array of undefined', () => {
    const acc = {
      value: [
        {
          a: {
            b: {
              c: 1
            }
          }
        },
        {
          a: {
            b: {
              c: 2
            }
          }
        },
        {
          a: {
            b: {
              c: 3
            }
          }
        }
      ]
    }
    const result = factory.create('$a.b.d[]').body(acc)
    expect(result).toEqual([undefined, undefined, undefined])
  })

  test('resolve invalid collection path to null', () => {
    const acc = {
      value: {
        a: {
          b: 'c'
        }
      }
    }
    const result = factory.create('$a.b.c[]').body(acc)
    expect(result).toBe(undefined)
  })
})
