const dataPoint = require('../').create()
const assert = require('assert')

const isArray = () => acc => {
  if (!(acc.value instanceof Array)) {
    throw new Error(`${acc.value} should be an Array`)
  }

  return acc.value
}

const resolveTo = value => errCtx => {
  // since we dont pass the error back
  // it will resolve to the new value
  return value
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
