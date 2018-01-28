const dataPoint = require('../').create()
const assert = require('assert')

const addStr = word => input => {
  return input + word
}

const reducers = [addStr(' World'), addStr('!!')]

dataPoint.resolve(reducers, 'Hello').then(output => {
  assert.equal(output, 'Hello World!!')
  console.log(output)
})
