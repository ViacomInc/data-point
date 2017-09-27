const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
}

const multiplyBy = factor => (acc, next) => {
  next(null, acc.value * factor)
}

const getMax = () => (acc, next) => {
  const result = Math.max.apply(null, acc.value)
  next(null, result)
}

dataPoint.transform(['$a.b.c', getMax(), multiplyBy(10)], input).then(acc => {
  assert.equal(acc.value, 30)
  console.log(acc.value)
})
