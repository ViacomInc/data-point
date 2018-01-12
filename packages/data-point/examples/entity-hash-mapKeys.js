const dataPoint = require('../').create()
const assert = require('assert')
const _ = require('lodash')

dataPoint.addEntities({
  'hash:mapKeys': {
    mapKeys: {
      name: '$name',
      url: [
        '$name',
        acc => {
          return `https://github.com/ViacomInc/${_.kebabCase(acc.value)}`
        }
      ]
    }
  }
})

const expectedResult = {
  name: 'DataPoint',
  url: 'https://github.com/ViacomInc/data-point'
}

const input = {
  name: 'DataPoint'
}

dataPoint.transform('hash:mapKeys', input).then(acc => {
  assert.deepEqual(acc.value, expectedResult)
  console.log(acc.value)
})
