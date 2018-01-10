/* eslint-env jest */
const assert = require('assert')

const DataPoint = require('../')
const dataPoint = DataPoint.create()

const { map } = DataPoint.helpers

const value = [
  {
    a: 1
  },
  {
    a: 2
  }
]

// applies the $a reducer to each
// item in the array
const reducer = map(['$a', acc => acc.value * 2])

dataPoint.transform(reducer, value).then(acc => {
  assert.deepEqual(acc.value, [2, 4])
})
