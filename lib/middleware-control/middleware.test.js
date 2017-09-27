/* eslint-env jest */
'use strict'

const _ = require('lodash')

const middleware = require('./middleware')

test('middleware#run - with no middleware', () => {
  const stack = []

  const expected = {
    foo: 'foo'
  }

  return middleware.execute(expected, stack).then(context => {
    expect(context).toEqual(expected)
  })
})

test('middleware#run - execute 1 middleware', () => {
  const stack = [
    (acc, next) => {
      acc.bar = 'bar'
      next(null)
    }
  ]

  const expected = {
    foo: 'foo',
    bar: 'bar'
  }

  return middleware.execute(expected, stack).then(context => {
    expect(context).toEqual(expected)
  })
})

test('middleware#run - catch unhandled error', () => {
  const stack = [
    (acc, next) => {
      throw new Error('unhandled')
    }
  ]

  const expected = {
    foo: 'foo',
    bar: 'bar'
  }

  return middleware.execute(expected, stack).catch(err => {
    expect(_.isError(err)).toBeTruthy()
    expect(err.message).toBe('unhandled')
  })
})

test('middleware#run - pass programmed middleware error', () => {
  const stack = [
    (acc, next) => {
      next(new Error('planned'))
    }
  ]

  const expected = {
    foo: 'foo',
    bar: 'bar'
  }

  return middleware.execute(expected, stack).catch(err => {
    expect(_.isError(err)).toBeTruthy()
    expect(err.message).toBe('planned')
  })
})

test('middleware#run - with multiple middleware methods', () => {
  const stack = [
    (acc, next) => {
      acc.a = 'a'
      next(null)
    },
    (acc, next) => {
      acc.b = 'b'
      next(null)
    },
    (acc, next) => {
      acc.c = 'c'
      next(null)
    }
  ]

  const expected = {
    a: 'a',
    b: 'b',
    c: 'c'
  }

  return middleware.execute(expected, stack).then(context => {
    expect(context).toEqual(expected)
  })
})

test('middleware#run - exit chain when ___done set to true', () => {
  const stack = [
    (acc, next) => {
      acc.a = 'a'
      next(null)
    },
    (acc, next) => {
      acc.b = 'b'
      acc.___done = true
      next(null)
    },
    (acc, next) => {
      /* istanbul ignore next */
      acc.c = 'c'
      /* istanbul ignore next */
      next(null)
    }
  ]

  const expected = {
    a: 'a',
    b: 'b'
  }

  return middleware.execute(expected, stack).then(context => {
    expect(context).toEqual(expected)
  })
})

test('middleware#run - exit chain on error', () => {
  const stack = [
    (acc, next) => {
      acc.a = 'a'
      next(null)
    },
    (acc, next) => {
      acc.b = 'b'
      next(new Error('planned'))
    },
    (acc, next) => {
      /* istanbul ignore next */
      acc.c = 'c'
      /* istanbul ignore next */
      next(null)
    }
  ]

  const expected = {
    a: 'a',
    b: 'b'
  }

  return middleware.execute(expected, stack).catch(err => {
    expect(_.isError(err)).toBeTruthy()
  })
})
