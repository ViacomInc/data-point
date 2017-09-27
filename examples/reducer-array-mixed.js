const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: 'Hello World'
  }
}

const toUpperCase = (acc, next) => {
  next(null, acc.value.toUpperCase())
}

dataPoint.transform(['$a.b', toUpperCase], input).then(acc => {
  assert.equal(acc.value, 'HELLO WORLD')
  console.log(acc.value)
})
