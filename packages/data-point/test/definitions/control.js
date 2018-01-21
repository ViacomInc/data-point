const _ = require('lodash')

const isEqualTo = (pathFrom, compareTo) => (acc, done) => {
  done(null, _.get(acc.value, pathFrom) === compareTo)
}

const returnValue = value => (acc, done) => {
  done(null, value)
}

const throwError = () => (acc, done) => {
  throw new Error('test')
}

module.exports = {
  'control:a.1.0': {
    select: [
      { case: isEqualTo('foo', 1), do: returnValue('a') },
      { case: isEqualTo('foo', 2), do: returnValue('b') },
      { default: returnValue('c') }
    ]
  },
  'control:a.1.1': {
    select: [
      { case: isEqualTo('foo', 2), do: returnValue('a') },
      { case: isEqualTo('foo', 1), do: returnValue('b') },
      { default: returnValue('c') }
    ]
  },
  'control:a.1.2': {
    select: [
      { case: isEqualTo('foo', 2), do: returnValue('a') },
      { case: isEqualTo('foo', 3), do: returnValue('b') },
      { default: returnValue('c') }
    ]
  },
  'control:a.2.0': {
    select: [
      { case: throwError('foo', 2), do: returnValue('a') },
      { default: returnValue('c') }
    ]
  },
  'control:a.2.1': {
    select: [
      { case: isEqualTo('foo', 1), do: throwError() },
      { default: returnValue('c') }
    ]
  },
  'control:a.2.2': {
    select: [
      { case: isEqualTo('foo', 2), do: returnValue('a') },
      { case: isEqualTo('foo', 3), do: returnValue('b') },
      { default: throwError() }
    ]
  }
}
