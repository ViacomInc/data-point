/* eslint-env jest */
const assert = require('assert')

const DataPoint = require('../')
const dataPoint = DataPoint.create()

const { find } = DataPoint.helpers

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
const reducer = find('$b')

dataPoint.transform(reducer, value).then(acc => {
  assert.deepEqual(acc.value, {
    b: 2
  })
})
