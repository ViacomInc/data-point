const DataPoint = require('../')
const dataPoint = DataPoint.create()
const helpers = DataPoint.helpers
const assert = require('assert')

dataPoint.addEntities({
  'model:string': {
    value: '$name',
    type: helpers.isString
  }
})

const input = {
  name: 'DataPoint'
}

dataPoint.transform('model:string', input).then(acc => {
  assert.equal(acc.value, 'DataPoint')
  console.log(acc.value)
})
