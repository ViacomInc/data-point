const dataPoint = require('../').create()
const assert = require('assert')

const reducer = acc => {
  return acc.value + ' World'
}

dataPoint.transform(reducer, 'Hello').then(acc => {
  console.log(acc.value)
  assert.equal(acc.value, 'Hello World')
})
