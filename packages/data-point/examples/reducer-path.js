const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: 'Hello World'
  }
}

dataPoint.transform('$a.b', input).then(acc => {
  assert.equal(acc.value, 'Hello World')
  console.log(acc.value)
})
