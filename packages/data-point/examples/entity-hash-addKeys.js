const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'hash:addKeys': {
    addKeys: {
      nameLowerCase: ['$name', acc => acc.value.toLowerCase()],
      url: () => 'https://github.com/ViacomInc/data-point'
    }
  }
})

const expectedResult = {
  name: 'DataPoint',
  nameLowerCase: 'datapoint',
  url: 'https://github.com/ViacomInc/data-point'
}

const input = {
  name: 'DataPoint'
}

dataPoint.transform('hash:addKeys', input).then(acc => {
  assert.deepEqual(acc.value, expectedResult)
  console.log(acc.value)
})
