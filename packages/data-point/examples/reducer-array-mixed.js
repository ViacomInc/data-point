const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: 'Hello World'
  }
}

const toUpperCase = input => {
  return input.toUpperCase()
}

dataPoint.resolve(['$a.b', toUpperCase], input).then(output => {
  assert.strictEqual(output, 'HELLO WORLD')
  console.log(output)
})
