const dataPoint = require('../').create()
const assert = require('assert')

const addStr = word => acc => {
  return acc.value + word
}

const reducers = [addStr(' World'), addStr('!!')]

dataPoint.transform(reducers, 'Hello').then(acc => {
  assert.equal(acc.value, 'Hello World!!')
  console.log(acc.value)
})
