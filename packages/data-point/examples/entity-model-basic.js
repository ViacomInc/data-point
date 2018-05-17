const assert = require('assert')
const DataPoint = require('../')

const { Model } = DataPoint.entities

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
dataPoint.resolve(myModel, input).then(output => {
  assert.equal(output, 30)
})
