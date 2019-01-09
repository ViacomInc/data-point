const dataPoint = require('../').create()
const assert = require('assert')

const toArray = input => {
  return Array.isArray(input) ? input : [input]
}

dataPoint.addEntities({
  'model:foo': {
    before: toArray,
    value: '$'
  }
})

dataPoint.resolve('model:foo', 100).then(output => {
  assert.deepStrictEqual(output, [100])
})
