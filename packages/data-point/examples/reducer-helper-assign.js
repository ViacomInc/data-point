/* eslint-env jest */
const assert = require('assert')

const DataPoint = require('../')
const dataPoint = DataPoint.create()

const value = {
  a: 1,
  b: {
    c: 2
  }
}

// merges the ReducerObject with
// the result with accumulator.value
const reducer = DataPoint.assign({
  c: '$b.c'
})

dataPoint.resolve(reducer, value).then(output => {
  assert.deepStrictEqual(output, {
    a: 1,
    b: {
      c: 2
    },
    c: 2
  })
})
