const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
}

const multiplyBy = factor => input => {
  return input * factor
}

const getMax = () => input => {
  const result = Math.max.apply(null, input)
  return result
}

dataPoint.resolve(['$a.b.c', getMax(), multiplyBy(10)], input).then(output => {
  assert.strictEqual(output, 30)
  console.log(output)
})
