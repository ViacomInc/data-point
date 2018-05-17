const assert = require('assert')
const DataPoint = require('../')

const Model = require('../lib/entity-types/entity-model')
// how it will be eventually (pulled individually)
// const Model = require('data-point-entity-model')

const input = {
  a: {
    b: {
      c: [1, 2, 3]
    }
  }
}

const getMax = input => {
  return Math.max.apply(null, input)
}

const multiplyBy = number => input => {
  return input * number
}

const myModel = Model('myModel', {
  value: ['$a.b.c', getMax, multiplyBy(10)]
})

const dataPoint = DataPoint.create()
dataPoint.resolve([myModel], input).then(output => {
  assert.equal(output, 30)
})
