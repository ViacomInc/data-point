/* eslint-env jest */
const assert = require('assert')

const DataPoint = require('../')
const dataPoint = DataPoint.create()

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
const reducer = DataPoint.map(['$a', input => input * 2])

dataPoint.resolve(reducer, value).then(output => {
  assert.deepStrictEqual(output, [2, 4])
})
