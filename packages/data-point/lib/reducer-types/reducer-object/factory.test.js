/* eslint-env jest */

const factory = require('./factory')
const createReducer = require('../index').create
const constant = require('../..').helpers.constant

test('ReducerObject.factory#isType', () => {
  expect(factory.isType('$foo')).toBe(false)
  expect(factory.isType(() => true)).toBe(false)
  expect(factory.isType([])).toBe(false)
  expect(factory.isType({})).toBe(true)
})

describe('ReducerObject.factory#getProps', () => {
  it('should accept an empty object', () => {
    const reducer = factory.getProps(createReducer, {})
    expect(reducer).toEqual({
      constants: {},
      reducers: []
    })
  })
  it('should accept a non-empty object', () => {
    const props = factory.getProps(createReducer, {
      a1: '$a[]',
      b1: {
        a2: ['$a2', () => false],
        b2: [
          {
            a3: 'transform:entity-name',
            b3: '$b1.b2.b3',
            c3: constant('CONSTANT')
          }
        ],
        c2: constant(1)
      },
      c1: constant({
        a: 1,
        b: 2
      }),
      d1: constant(5)
    })
    expect(props).toMatchSnapshot()
  })
})

describe('ReducerObject.factory#getSourceFunction', () => {
  it('creates a function that returns a new object', () => {
    const input = {
      a: 1,
      b: {
        c: '1',
        d: () => true
      }
    }
    const fn = factory.getSourceFunction(input)
    const output = fn()

    expect(fn.name).toBe('source')
    expect(input === output).toBe(false)
    expect(input).toEqual(output)
    expect(output.b.d()).toBe(true)
  })
})

describe('ReducerObject.factory#create', () => {
  it('reducer object with no props argument', () => {
    const reducer = factory.create(createReducer)
    expect(reducer).toMatchSnapshot()
    expect(reducer.source()).toEqual({})
  })
  it('reducer object with props argument', () => {
    const reducer = factory.create(createReducer, {
      a: '$a',
      b: '$b',
      c: constant('c')
    })
    expect(reducer).toMatchSnapshot()
    expect(reducer.source()).toEqual({ c: 'c' })
  })
})
