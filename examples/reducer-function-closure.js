const dataPoint = require('../').create()
const assert = require('assert')

const addStr = value => (acc, next) => {
  next(null, acc.value + value)
}

dataPoint.transform(addStr(' World!!'), 'Hello').then(acc => {
  assert.equal(acc.value, 'Hello World!!')
  console.log(acc.value)
})
