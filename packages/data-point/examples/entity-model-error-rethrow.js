const dataPoint = require('../').create()
const assert = require('assert')

const logError = acc => {
  // acc.value holds the actual Error Object
  console.log(acc.value.toString())
  throw acc.value
}

dataPoint.addEntities({
  'model:getArray': {
    value: '$a',
    outputType: 'array',
    error: logError
  }
})

const input = {
  a: {
    b: 'foo'
  }
}

dataPoint
  .transform('model:getArray', input)
  .then(() => {
    // should not execute
    assert.ok(false)
  })
  .catch(error => {
    console.log(error.toString())
    // should execute
    assert.ok(true)
  })
