/* eslint-env jest */

const core = require('./core')

const reducers = require('../../test/utils/reducers')
const entities = require('../../test/definitions/entities')

const Transform = require('./transform')
const TestData = require('../../test/data.json')

let dataPoint

beforeAll(() => {
  dataPoint = core.create({
    values: {
      v1: 'v1'
    },
    reducers: {
      test: reducers
    },
    entities
  })
})

test('transform - throw error in invalid id(promise)', () => {
  return Transform.transform(dataPoint, 'INVALID', TestData, {})
    .catch(err => err)
    .then(res => {
      expect(res).toBeInstanceOf(Error)
      expect(res).toMatchSnapshot()
    })
})

describe('transform - should attach input value to accumulator', () => {
  test('passing undefined', () => {
    return Transform.transform(dataPoint, value => {
      expect(value).toBe(undefined)
    })
  })

  test('passing 0', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toBe(0)
      },
      0
    )
  })

  test('passing 1', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toBe(1)
      },
      1
    )
  })

  test('passing empty string', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toBe('')
      },
      ''
    )
  })

  test('passing a string', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toBe('Hello World')
      },
      'Hello World'
    )
  })

  test('passing false', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toBe(false)
      },
      false
    )
  })

  test('passing true', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toBe(true)
      },
      true
    )
  })

  test('passing an array', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toEqual(['Hello World'])
      },
      ['Hello World']
    )
  })

  test('passing an object', () => {
    return Transform.transform(
      dataPoint,
      value => {
        expect(value).toEqual({ message: 'Hello World' })
      },
      { message: 'Hello World' }
    )
  })
})

test('transform - single reducer', () => {
  const reducer = value => {
    return value + ' World'
  }
  return Transform.transform(dataPoint, reducer, 'Hello').then(res => {
    expect(res.value).toEqual('Hello World')
  })
})

test('transform - reducer chain', () => {
  const reducers = [value => value + ' World', value => value + '!!']
  return Transform.transform(dataPoint, reducers, 'Hello').then(res => {
    expect(res.value).toEqual('Hello World!!')
  })
})

test('transform - reducer path', () => {
  return Transform.transform(dataPoint, '$a.b.c', TestData).then(res => {
    expect(res.value).toEqual([1, 2, 3])
  })
})

test('transform - reducer mixed', () => {
  const getMax = value => {
    return Math.max.apply(null, value)
  }
  return Transform.transform(dataPoint, ['$a.b.c', getMax], TestData).then(
    res => {
      expect(res.value).toEqual(3)
    }
  )
})

describe('options argument', () => {
  test('passing locals', () => {
    const reducer = (value, acc) => {
      return acc.locals.greeting + ' World'
    }

    const options = {
      locals: {
        greeting: 'Hello'
      }
    }

    return Transform.transform(dataPoint, reducer, {}, options).then(res => {
      expect(res.value).toEqual('Hello World')
    })
  })
})

describe('resolve', () => {
  test('transform - resolve', () => {
    return Transform.resolve(dataPoint, '$a.b.c', TestData).then(value => {
      expect(value).toEqual([1, 2, 3])
    })
  })
  test('transform - options is last argument', () => {
    const options = {
      locals: {
        foo: 'bar'
      }
    }
    return Transform.resolve(dataPoint, '$..locals.foo', {}, options).then(
      value => {
        expect(value).toEqual('bar')
      }
    )
  })

  test('transform - execute with 3 arguments', () => {
    const value = {
      foo: 'bar'
    }
    return Promise.resolve(value)
      .then(Transform.resolve(dataPoint, '$foo'))
      .then(value => {
        expect(value).toEqual('bar')
      })
  })
})
