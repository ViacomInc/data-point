const dataPoint = require('../').create()
const assert = require('assert')

const addStr = value => input => {
  return input + value
}

dataPoint.resolve(addStr(' World!!'), 'Hello').then(output => {
  assert.equal(output, 'Hello World!!')
  console.log(output)
})
