/* eslint-env jest */
const assert = require('assert')

const DataPoint = require('../')
const dataPoint = DataPoint.create()

const value = [
  {
    a: 1
  },
  {
    b: 2
  }
]

// the $b reducer is truthy for the
// second element in the array
const reducer = DataPoint.find('$b')

dataPoint.resolve(reducer, value).then(output => {
  assert.deepStrictEqual(output, {
    b: 2
  })
})
