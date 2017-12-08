const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: 'Hello World'
  },
  c: [
    {
      d: {
        e: 1
      }
    },
    {
      d: {
        e: 2
      }
    },
    {
      d: {
        e: 3
      }
    }
  ]
}

dataPoint.transform('$a.b', input).then(acc => {
  assert.equal(acc.value, 'Hello World')
  console.log(acc.value)
})

dataPoint.transform('$d.e[]', input.c).then(acc => {
  assert.deepEqual(acc.value, [1, 2, 3])
  console.log(acc.value)
})
