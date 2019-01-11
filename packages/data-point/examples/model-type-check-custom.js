const assert = require('assert')
const DataPoint = require('../')
const dataPoint = DataPoint.create()

dataPoint.addEntities({
  'model:string': {
    value: '$name',
    outputType: input => {
      const valid = typeof input === 'string' && input.length > 5
      if (!valid) {
        throw new Error('string and length > 5')
      }
    }
  }
})

const input = {
  name: 'DataPoint'
}

dataPoint.resolve('model:string', input).then(output => {
  assert.strictEqual(output, 'DataPoint')
  console.log(output)
})
