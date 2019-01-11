const dataPoint = require('../').create()
const assert = require('assert')
const _ = require('lodash')

dataPoint.addEntities({
  'hash:mapKeys': {
    mapKeys: {
      name: '$name',
      url: [
        '$name',
        input => {
          return `https://github.com/ViacomInc/${_.kebabCase(input)}`
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

dataPoint.resolve('hash:mapKeys', input).then(output => {
  assert.deepStrictEqual(output, expectedResult)
  console.log(output)
})
