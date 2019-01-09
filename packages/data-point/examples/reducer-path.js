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

dataPoint.resolve('$a.b', input).then(output => {
  assert.strictEqual(output, 'Hello World')
  console.log(output)
})

dataPoint.resolve('$d.e[]', input.c).then(output => {
  assert.deepStrictEqual(output, [1, 2, 3])
  console.log(output)
})
