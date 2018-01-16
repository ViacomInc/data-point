const assert = require('assert')
const DataPoint = require('../')
const dataPoint = DataPoint.create()

dataPoint.addEntities({
  'model:string': {
    value: '$name',
    type: acc => {
      const valid = typeof acc.value === 'string' && acc.value.length > 5
      return valid || 'string and length > 5'
    }
  }
})

const input = {
  name: 'DataPoint'
}

dataPoint.transform('model:string', input).then(acc => {
  assert.equal(acc.value, 'DataPoint')
  console.log(acc.value)
})
