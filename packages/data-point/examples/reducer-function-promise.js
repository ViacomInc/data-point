const dataPoint = require('../').create()
const assert = require('assert')

const reducer = input => {
  return Promise.resolve(input + ' World')
}

dataPoint.resolve(reducer, 'Hello').then(output => {
  console.log(output)
  assert.strictEqual(output, 'Hello World')
})
