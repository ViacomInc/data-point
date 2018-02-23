/* eslint-env jest */

const nock = require('nock')
const Promise = require('bluebird')
const DataPoint = require('data-point')
const { assign, filter, map, find } = DataPoint.helpers

const debugUtils = require('./index')
const schemaA10 = require('../../test/definitions/schema')

// TODO have a test for every reducer helper type

const _true = () => true

const _false = () => false

const identity = input => input

function throwError (acc) {
  throw new Error('test error message')
}

function testError (reducer, input) {
  return dataPoint
    .resolve(reducer, input)
    .catch(error => error)
    .then(result => {
      expect(result).toBeInstanceOf(Error)
      expect(result).toHaveProperty('_value')
      expect(result).toHaveProperty('_stack')
      expect(result._value).toMatchSnapshot()
      expect(result._stack).toMatchSnapshot()
    })
}

const throwIfEquals = v1 => v2 => {
  return v1 === v2 ? throwError() : false
}

nock('http://remote.test')
  .get('/')
  .reply(200, {
    ok: true
  })

nock('http://remote.test')
  .get('/source1')
  .reply(404, 'not found')

const dataPoint = DataPoint.create({
  entities: {
    'transform:1': () => {
      throw new Error('test error')
    },
    'transform:2': 'transform:1',
    'transform:3': 'transform:2',

    'request:1': {
      value: [identity, throwError],
      url: 'http://remote.test'
    },
    'request:2': {
      options: {
        x: () => 'apples',
        y: [identity, throwError]
      },
      url: 'http://remote.test'
    },
    'request:3': {
      before: throwError,
      url: 'http://remote.test'
    },
    'request:4': {
      url: 'http://remote.test',
      after: throwError
    },
    'request:5': {
      url: 'http://remote.test/source1'
    },

    // fail first case
    'control:1': {
      select: [
        { case: throwError, do: throwError },
        { case: throwError, do: throwError },
        { default: throwError }
      ]
    },
    // fail second case
    'control:2': {
      select: [
        { case: _false, do: throwError },
        { case: throwError, do: throwError },
        { default: throwError }
      ]
    },
    // fail first do
    'control:3': {
      select: [
        { case: _true, do: throwError },
        { case: throwError, do: throwError },
        { default: throwError }
      ]
    },
    // fail second do
    'control:4': {
      select: [
        { case: _false, do: throwError },
        { case: _true, do: throwError },
        { default: _true }
      ]
    },
    // fail default
    'control:5': {
      select: [
        { case: _false, do: throwError },
        { case: _false, do: throwError },
        { default: throwError }
      ]
    },

    'model:1': {
      before: throwError
    },
    'model:2': {
      value: throwError
    },
    'model:3': {
      after: throwError
    },
    'model:4': {
      value: throwError,
      error: throwError
    },

    'entry:1': {
      before: throwError
    },
    'entry:2': {
      value: throwError
    },
    'entry:3': {
      after: throwError
    },
    'entry:4': {
      value: throwError,
      error: throwError
    },

    'entry:type-check-1': {
      inputType: 'string'
    },
    'entry:type-check-2': {
      value: () => 500,
      outputType: 'string'
    },
    'entry:type-check-3': {
      inputType: 'schema:a.1.0'
    },
    'entry:type-check-4': {
      value: () => 500,
      outputType: 'schema:a.1.0'
    },

    'schema:with-value-prop': {
      value: throwError,
      schema: {
        type: 'object'
      }
    }
  }
})

dataPoint.addEntities(schemaA10)

describe('transform entity stack traces', () => {
  test('transform:1', () => {
    return testError('transform:1', { x: 1 })
  })
  test('transform:2', () => {
    return testError('transform:2', { x: 1 })
  })
  test('transform:3', () => {
    return testError('transform:3', { x: 1 })
  })
})

describe('request entity stack traces', () => {
  test('request:1', () => {
    return testError('request:1', { x: 1 })
  })
  test('request:2', () => {
    return testError('request:2', { x: 1 })
  })
  test('request:3', () => {
    return testError('request:3', { x: 1 })
  })
  test('request:4', () => {
    return testError('request:4', { x: 1 })
  })
  test('request:5', () => {
    return testError('request:5', { x: 1 })
  })
})

describe('control entity stack traces', () => {
  test('control:1', () => {
    return testError('control:1', { x: 1 })
  })
  test('control:2', () => {
    return testError('control:2', { x: 1 })
  })
  test('control:3', () => {
    return testError('control:3', { x: 1 })
  })
  test('control:4', () => {
    return testError('control:4', { x: 1 })
  })
  test('control:5', () => {
    return testError('control:5', { x: 1 })
  })
})

describe('model entity stack traces', () => {
  test('model:1', () => {
    return testError('model:1', { x: 1 })
  })
  test('model:2', () => {
    return testError('model:2', { x: 1 })
  })
  test('model:3', () => {
    return testError('model:3', { x: 1 })
  })
  test('model:4', () => {
    return testError('model:4', { x: 1 })
  })
})

describe('entry entity stack traces', () => {
  test('entry:1', () => {
    return testError('entry:1', { x: 1 })
  })
  test('entry:2', () => {
    return testError('entry:2', { x: 1 })
  })
  test('entry:3', () => {
    return testError('entry:3', { x: 1 })
  })
  test('entry:4', () => {
    return testError('entry:4', { x: 1 })
  })

  test('entry:type-check-1', () => {
    return testError('entry:type-check-1', { x: 1 })
  })
  test('entry:type-check-2', () => {
    return testError('entry:type-check-2', { x: 1 })
  })
  test('entry:type-check-3', () => {
    return testError('entry:type-check-3', { x: 1 })
  })
  test('entry:type-check-4', () => {
    return testError('entry:type-check-4', { x: 1 })
  })
})

describe('schema entity stack traces', () => {
  test('schema:with-value-prop', () => {
    return testError('schema:with-value-prop', { x: 1 })
  })

  test('schema:a.1.0', () => {
    return testError('schema:a.1.0', {
      foo: 1,
      baaaaaar: '1'
    })
  })
})

describe('ReducerFunction', () => {
  test('with sync error', () => {
    return testError(throwError, 'input')
  })
  test('with async error', () => {
    return testError(acc => {
      return Promise.try(throwError).delay(10)
    }, 'input')
  })
})

describe('ReducerList with errors', () => {
  test('1st item has error', () => {
    const reducer = [throwError]
    return testError(reducer, 'input')
  })
  test('2nd item has error', () => {
    const reducer = [identity, throwError]
    return testError(reducer, 'input')
  })
  test('3rd item has error', () => {
    const reducer = ['$a', '$b', input => input()]
    const input = {
      a: {
        b: throwError
      }
    }
    return testError(reducer, input)
  })
})

describe('ReducerObject with errors', () => {
  test('single property', () => {
    const reducer = {
      a: '$a',
      b: throwError
    }
    return testError(reducer, { a: 1, b: 2 })
  })
  test('nested property', () => {
    const reducer = {
      a: '$a',
      b: {
        c: {
          d: throwError
        }
      }
    }
    return testError(reducer, { a: 1, b: { c: { d: 1 } } })
  })
})

describe('do not log names for anonymous functions', () => {
  test('function in ReducerList', () => {
    const reducer = [
      () => {
        throw new Error('test error')
      }
    ]
    return testError(reducer, { x: 1 })
  })
  test('function with inferred name from variable', () => {
    const anonFunction = () => {
      throw new Error('test error')
    }
    return testError(anonFunction, { x: 1 })
  })
  test('function with inferred name from object property', () => {
    const reducer = {
      a: () => {
        throw new Error('test error')
      }
    }
    return testError(reducer, { a: 1 })
  })
})

describe('ReducerAssign', () => {
  test('invalid input type', () => {
    const reducer = assign({ a: throwError, b: '$b' })
    return testError(reducer, { a: 1, b: 2 })
  })
  test('invalid input type', () => {
    const reducer = assign({ a: '$a', b: throwError })
    return testError(reducer, { a: 1, b: 2 })
  })
})

describe('ReducerMap', () => {
  test('invalid input type', () => {
    const reducer = map('$a')
    return testError(reducer, false)
  })
  test('throw error on 1st item', () => {
    const reducer = map(throwIfEquals(1))
    return testError(reducer, [1, 2])
  })
  test('throw error on 2nd item', () => {
    const reducer = map(throwIfEquals(2))
    return testError(reducer, [1, 2])
  })
})

describe('ReducerFilter', () => {
  test('invalid input type', () => {
    const reducer = filter('$a')
    return testError(reducer, false)
  })
  test('throw error on 1st item', () => {
    const reducer = filter(throwIfEquals(1))
    return testError(reducer, [1, 2])
  })
  test('throw error on 2nd item', () => {
    const reducer = filter(throwIfEquals(2))
    return testError(reducer, [1, 2])
  })
})

describe('ReducerFind', () => {
  test('invalid input type', () => {
    const reducer = find('$a')
    return testError(reducer, false)
  })
  test('throw error on 1st item', () => {
    const reducer = find(throwIfEquals(1))
    return testError(reducer, [1, 2])
  })
  test('throw error on 2nd item', () => {
    const reducer = find(throwIfEquals(2))
    return testError(reducer, [1, 2])
  })
})

describe('stringifyReducerStack', () => {
  const toString = debugUtils.stringifyReducerStack
  test("should stringify: [] => ''", () => {
    expect(toString([])).toBe('')
  })
  test("should stringify: [0] => '[0]'", () => {
    expect(toString([0])).toBe('[0]')
  })
  test("should stringify: ['abc'] => 'abc'", () => {
    expect(toString(['abc'])).toBe('abc')
  })
  test("should stringify: [['abc']] => '[abc]'", () => {
    expect(toString([['abc']])).toBe('[abc]')
  })
  test("should stringify: [['a', 'b']] => '[a.b]'", () => {
    expect(toString([['a', 'b']])).toBe('[a.b]')
  })
  test("should stringify: ['abc', 'def'] => 'abc -> def'", () => {
    expect(toString(['abc', 'def'])).toBe('abc -> def')
  })
  test("should stringify: ['abc', ['a'], 'def', ['b', 'c']] => 'abc[a] -> def[b.c]'", () => {
    expect(toString(['abc', ['a'], 'def', ['b', 'c']])).toBe(
      'abc[a] -> def[b.c]'
    )
  })
  test("should stringify: ['abc', 'def', ['a'], 0] => 'abc -> def[a][0]'", () => {
    expect(toString(['abc', 'def', ['a'], 0])).toBe('abc -> def[a][0]')
  })
})
