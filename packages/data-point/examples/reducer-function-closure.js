const dataPoint = require('../').create()
const assert = require('assert')

const addStr = value => input => {
  return input + value
}

dataPoint.resolve(addStr(' World!!'), 'Hello').then(output => {
  assert.strictEqual(output, 'Hello World!!')
  console.log(output)
})
