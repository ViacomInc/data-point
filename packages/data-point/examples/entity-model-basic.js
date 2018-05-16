const assert = require('assert')
const DataPoint = require('../')
const dataPoint = DataPoint.create()

const EntityModel = require('../lib/entity-types/entity-model')
const { entity } = DataPoint.helpers

function Model (id, spec) {
  return entity(`model:${id}`, EntityModel.create(spec, `model:${id}`))
}

const myModel = Model('myModel', {
  value: (val) => val * 100
})

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

dataPoint.addEntities({
  'model:foo': {
    value: ['$a.b.c', getMax, multiplyBy(10), myModel]
  }
})

dataPoint.resolve('model:foo', input).then(output => {
  assert.equal(output, 30)
})
