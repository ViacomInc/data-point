const dataPoint = require('../').create()
const assert = require('assert')
const mockRequest = require('./entity-request-basic.mock')

dataPoint.addEntities({
  'request:getLuke': {
    url: 'https://swapi.co/api/people/{locals.personId}/'
  }
})

// mock the remote service
mockRequest()

const options = {
  locals: {
    personId: 1
  },
  entityOverrides: {
    request: {
      params: {
        inspect: true
      }
    }
  }
}

dataPoint.resolve('request:getLuke', {}, options).then(output => {
  assert.equal(output.name, 'Luke Skywalker')
  assert.equal(output.height, '172')
  console.dir(output, { colors: true })
})
