const dataPoint = require('../').create()
const assert = require('assert')

const reducer = (input, acc, next) => {
  next(null, input + ' World')
}

dataPoint.resolve(reducer, 'Hello').then(output => {
  assert.strictEqual(output, 'Hello World')
  console.log(output)
})
