/* eslint-env jest */

const core = require('./core')

const reducers = require('../../test/utils/reducers')
const entities = require('../../test/definitions/entities')

const transform = require('./transform')
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
  return transform(dataPoint, 'INVALID', TestData, {})
    .catch(err => err)
    .then(res => {
      expect(res).toBeInstanceOf(Error)
      expect(res).toMatchSnapshot()
    })
})

describe('transform - should attach input value to accumulator', () => {
  test('passing undefined', () => {
    return transform(dataPoint, acc => {
      expect(acc.value).toBe(undefined)
    })
  })

  test('passing 0', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toBe(0)
      },
      0
    )
  })

  test('passing 1', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toBe(1)
      },
      1
    )
  })

  test('passing empty string', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toBe('')
      },
      ''
    )
  })

  test('passing a string', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toBe('Hello World')
      },
      'Hello World'
    )
  })

  test('passing false', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toBe(false)
      },
      false
    )
  })

  test('passing true', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toBe(true)
      },
      true
    )
  })

  test('passing an array', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toEqual(['Hello World'])
      },
      ['Hello World']
    )
  })

  test('passing an object', () => {
    return transform(
      dataPoint,
      acc => {
        expect(acc.value).toEqual({ message: 'Hello World' })
      },
      { message: 'Hello World' }
    )
  })
})

test('transform - single reducer', () => {
  const reducer = (acc, next) => {
    next(null, acc.value + ' World')
  }
  return transform(dataPoint, reducer, 'Hello').then(res => {
    expect(res.value).toEqual('Hello World')
  })
})

test('transform - reducer chain', () => {
  const reducers = [
    (acc, next) => {
      next(null, acc.value + ' World')
    },
    (acc, next) => {
      next(null, acc.value + '!!')
    }
  ]
  return transform(dataPoint, reducers, 'Hello').then(res => {
    expect(res.value).toEqual('Hello World!!')
  })
})

test('transform - reducer path', () => {
  return transform(dataPoint, '$a.b.c', TestData).then(res => {
    expect(res.value).toEqual([1, 2, 3])
  })
})

test('transform - reducer mixed', () => {
  const getMax = (acc, next) => {
    next(null, Math.max.apply(null, acc.value))
  }
  return transform(dataPoint, ['$a.b.c', getMax], TestData).then(res => {
    expect(res.value).toEqual(3)
  })
})

describe('options argument', () => {
  test('passing locals', () => {
    const reducer = (acc, next) => {
      next(null, acc.locals.greeting + ' World')
    }

    const options = {
      locals: {
        greeting: 'Hello'
      }
    }

    return transform(dataPoint, reducer, {}, options).then(res => {
      expect(res.value).toEqual('Hello World')
    })
  })
})

describe('throw error with reducer stack attached', () => {
  test('error', () => {
    const throwError = () => {
      throw new Error('test error')
    }
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(foo => foo)

    return transform(dataPoint, throwError, {}, { debug: true })
      .catch(err => err)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result).toHaveProperty('rstack')
        expect(result).toHaveProperty('rvalue')
        expect(consoleSpy.mock.calls).toMatchSnapshot()
        consoleSpy.mockRestore()
      })
  })
})
