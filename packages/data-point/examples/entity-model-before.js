const dataPoint = require('../').create()
const assert = require('assert')

const toArray = acc => {
  return Array.isArray(acc.value) ? acc.value : [acc.value]
}

dataPoint.addEntities({
  'model:foo': {
    before: toArray,
    value: '$'
  }
})

dataPoint.transform('model:foo', 100).then(acc => {
  assert.deepEqual(acc.value, [100])
})
