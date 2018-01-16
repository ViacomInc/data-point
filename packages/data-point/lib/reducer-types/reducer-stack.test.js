/* eslint-env jest */

const Promise = require('bluebird')

const attempt = require('lodash/attempt')

const reducerStack = require('./reducer-stack')

describe('reducer-stack#onReducerError', () => {
  it('should attach properties to the given error', () => {
    const stack = ['a', 'b']
    const value = { a: 1, b: 2 }
    const error = new Error()
    const e = attempt(reducerStack.onReducerError, stack, value, error)

    expect(e).toEqual(error)
    expect(e.rstack).toEqual(stack)
    expect(e.rvalue).toEqual(value)
  })
})

test('reducer-stack#stringifyReducerStack', () => {
  expect(reducerStack.stringifyReducerStack([])).toBe('')
  expect(reducerStack.stringifyReducerStack([0])).toBe('[0]')
  expect(reducerStack.stringifyReducerStack(['abc'])).toBe('abc')
  expect(reducerStack.stringifyReducerStack([['abc']])).toBe('[abc]')
  expect(reducerStack.stringifyReducerStack([['a', 'b']])).toBe('[a.b]')
  expect(reducerStack.stringifyReducerStack(['abc', 'def'])).toBe('abc -> def')
  expect(
    reducerStack.stringifyReducerStack(['abc', ['a'], 'def', ['b', 'c']])
  ).toBe('abc[a] -> def[b.c]')
  expect(reducerStack.stringifyReducerStack(['abc', 'def', ['a'], 0])).toBe(
    'abc -> def[a][0]'
  )
})

const DataPoint = require('data-point')

const dataPoint = DataPoint.create({
  //   entities: {
  //     'transform:x': () => {
  //       throw new Error()
  //     }
  //   }
})

/// ////////////////////////////////////////////////////////////////////////////////

const spy = jest.spyOn(console, 'error').mockImplementation(foo => foo)

function testError (reducer, input) {
  const options = { debug: true }
  return dataPoint
    .transform(reducer, input, options)
    .catch(e => e)
    .then(e => {
      expect(e).toBeInstanceOf(Error)
      expect(e.rstack).toMatchSnapshot()
      expect(e.rvalue).toMatchSnapshot()
      expect(spy.mock.calls).toMatchSnapshot()
      spy.mockClear()
    })
}

function throwError (acc) {
  throw new Error('test error')
}

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

describe.only('ReducerList with errors', () => {
  test('', () => {
    const reducer = [throwError]
    return testError(reducer, 'input')
  })
  test('', () => {
    const reducer = [acc => acc.value, throwError]
    return testError(reducer, 'input')
  })
  test.only('', () => {
    const reducer = ['$a', '$b', acc => acc.value()]
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
    return testError(reducer, { a: 1 })
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
    return testError(reducer, { b: { c: { d: 1 } } })
  })
})

// let manager

// const DataPoint = require('data-point')

// function throwError () {
//   throw new Error('test error')
// }

// beforeAll(() => {
//   manager = DataPoint.create({
//     'transform:x': throwError
//   })
// })

// control
// entry
// request
// schema
// transform
// model

// function
// list
// object

// assign
// filter
// find
// map

/// ////////////////////////////////////////////////////////////////////

// const nock = require('nock')

// const DataPoint = require('data-point')

// const identity = (acc) => acc.value

// const _true = () => true

// const _false = () => false

// function throwError () {
//   throw new Error ('test error')
// }

// const dataPoint = DataPoint.create({
//   entities: {
//     'transform:1': () => {
//       throw new Error()
//     },
//     'transform:2': 'transform:1',
//     'transform:3': 'transform:2',

//     'request:1': {
//       beforeRequest: [identity, throwError],
//       url: 'http://remote.test'
//     },
//     'request:2': {
//       options: {
//         '$x': [identity, throwError]
//       },
//       url: 'http://remote.test'
//     },
//     'request:3': {
//       url: 'http://remote.test',
//       after: throwError
//     },

//     // fail first case
//     'control:1': {
//       select: [
//         { case: throwError, do: throwError },
//         { case: throwError, do: throwError },
//         { default: throwError }
//       ],
//     },
//     // fail second case
//     'control:2': {
//       select: [
//         { case: _false, do: throwError },
//         { case: throwError, do: throwError },
//         { default: throwError }
//       ],
//     },
//     // fail first do
//     'control:3': {
//       select: [
//         { case: _true, do: throwError },
//         { case: throwError, do: throwError },
//         { default: throwError }
//       ],
//     },
//     // fail second do
//     'control:4': {
//       select: [
//         { case: _false, do: throwError },
//         { case: _true, do: throwError },
//         { default: _true }
//       ],
//       default: _true
//     },
//     // fail default
//     'control:5': {
//       select: [
//         { case: _false, do: throwError },
//         { case: _false, do: throwError },
//         { default: throwError }
//       ]
//     },

//     'model:1': {
//       before: throwError
//     },

//     'model:2': {
//       value: throwError
//     },

//     'model:3': {
//       after: throwError
//     },

//     'entry:1': {
//       before: throwError
//     },

//     'entry:2': {
//       value: throwError
//     },

//     'entry:3': {
//       after: throwError
//     },

//     'schema:a.1.0': {
//       schema: {
//         type: 'object',
//         properties: {
//           foo: {
//             type: 'integer'
//           },
//           bar: {
//             type: 'string'
//           }
//         },
//         required: ['foo', 'bar']
//       },
//       options: {
//         v5: false
//       }
//     }
//   }
// })

// dataPoint.transform('schema:a.1.0', { fooa: 1, bar: '1' }, { debug: true })

// // failed request
// // test request.value or remove support for it
// // schema, request, entry all have the 'value' for testing
// // test with anonymous function, make sure it has no name
// // a couple of more complex tests with a lot of nesting

// // dataPoint.transform('transform:3', true, { debug: true })
// // dataPoint.transform('entry:3', true, { debug: true })
