const dataPoint = require('../').create()
const assert = require('assert')

const isArray = () => (acc, next) => {
  if (acc.value instanceof Array) {
    // if the value is valid, then just pass it along
    return next(null, acc.value)
  }

  // notice how we pass this Error object as the FIRST parameter,
  // this tells DataPoint there was an error, and treat it as such.
  next(new Error(`${acc.value} should be an Array`))
}

const resolveTo = value => (errCtx, next) => {
  // since we dont pass the error back
  // it will resolve to the new value
  next(null, value)
}

dataPoint.addEntities({
  'entry:foo': {
    value: '$a',
    after: isArray(),
    // resolving the value to empty array
    error: resolveTo([])
  }
})

const input = {
  a: {
    b: [3, 15, 6, 3, 8]
  }
}

dataPoint.transform('entry:foo', input).then(acc => {
  assert.deepEqual(acc.value, [])
  console.log(acc.value)
  // []
})
