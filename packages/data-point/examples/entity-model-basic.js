const assert = require('assert')
const DataPoint = require('../')
const dataPoint = DataPoint.create()

const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
}

const getMax = acc => {
  return Math.max.apply(null, acc.value)
}

const multiplyBy = number => acc => {
  return acc.value * number
}

dataPoint.addEntities({
  'model:foo': {
    value: ['$a.b.c', getMax, multiplyBy(10)]
  }
})

dataPoint.transform('model:foo', input).then(acc => {
  assert.equal(acc.value, 30)
})
