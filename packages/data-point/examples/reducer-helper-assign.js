/* eslint-env jest */
const assert = require('assert')

const DataPoint = require('../')
const dataPoint = DataPoint.create()

const { assign } = DataPoint.helpers

const value = {
  a: 1,
  b: {
    c: 2
  }
}

// merges the ReducerObject with
// the result with accumulator.value
const reducer = assign({
  c: '$b.c'
})

dataPoint.transform(reducer, value).then(acc => {
  assert.deepEqual(acc.value, {
    a: 1,
    b: {
      c: 2
    },
    c: 2
  })
})
