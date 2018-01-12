const dataPoint = require('../').create()
const assert = require('assert')
const mockRequest = require('./entity-request-basic.mock')

dataPoint.addEntities({
  'request:getLuke': {
    url: 'https://swapi.co/api/people/1/'
  }
})

// mock the remote service
mockRequest()

dataPoint.transform('request:getLuke', {}).then(acc => {
  const result = acc.value
  assert.equal(result.name, 'Luke Skywalker')
  assert.equal(result.height, '172')
  console.dir(acc.value, { colors: true })
})
