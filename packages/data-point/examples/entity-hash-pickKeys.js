const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'hash:pickKeys': {
    pickKeys: ['url']
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

dataPoint.resolve('hash:pickKeys', input).then(output => {
  assert.deepEqual(output, expectedResult)
  console.log(output)
})
