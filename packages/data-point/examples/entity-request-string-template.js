const dataPoint = require('../').create()
const assert = require('assert')
const mockRequest = require('./entity-request-basic.mock')

dataPoint.addEntities({
  'request:getLuke': {
    url: 'https://swapi.co/api/people/{value.personId}/'
  }
})

// mock the remote service
mockRequest()

const input = {
  personId: 1
}

dataPoint.resolve('request:getLuke', input).then(output => {
  assert.equal(output.name, 'Luke Skywalker')
  assert.equal(output.height, '172')
  console.dir(output, { colors: true })
})
