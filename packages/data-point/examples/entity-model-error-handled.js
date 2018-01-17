const assert = require('assert')
const dataPoint = require('../').create()

dataPoint.addEntities({
  'model:getArray': {
    // points to a NON Array value
    value: '$a.b',
    outputType: 'array',
    error: acc => {
      // prints out the error
      // message generated by
      // isArray type check
      console.log(acc.value.message)

      console.log('Value is invalid, resolving to empty array')

      // passing a value will stop
      // the propagation of the error
      return []
    }
  }
})

const input = {
  a: {
    b: 'foo'
  }
}

dataPoint.transform('model:getArray', input).then(acc => {
  assert.deepEqual(acc.value, [])
})
