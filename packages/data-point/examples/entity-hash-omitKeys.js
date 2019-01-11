const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'hash:omitKeys': {
    omitKeys: ['name']
  }
})

// notice how name is no longer in the object
const expectedResult = {
  url: 'https://github.com/ViacomInc/data-point'
}

const input = {
  name: 'DataPoint',
  url: 'https://github.com/ViacomInc/data-point'
}

dataPoint.resolve('hash:omitKeys', input).then(output => {
  assert.deepStrictEqual(output, expectedResult)
  console.log(output)
})
