/* eslint-env jest */
const assert = require('assert')

const DataPoint = require('../')
const dataPoint = DataPoint.create()

const { filter } = DataPoint.helpers

const value = [
  {
    a: 1
  },
  {
    a: 2
  }
]

// filters array elements that are not
// truthy for the given reducer list
const reducer = filter(['$a', acc => acc.value > 1])

dataPoint.transform(reducer, value).then(acc => {
  assert.deepEqual(acc.value, [{ a: 2 }])
})
