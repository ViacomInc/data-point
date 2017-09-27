const dataPoint = require('../').create()
const assert = require('assert')

const reducer = (acc, next) => {
  next(null, acc.value + ' World')
}

dataPoint.transform(reducer, 'Hello').then(acc => {
  assert.equal(acc.value, 'Hello World')
  console.log(acc.value)
})
