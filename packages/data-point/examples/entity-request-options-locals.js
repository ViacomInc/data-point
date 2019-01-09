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
  }
}

dataPoint.resolve('request:getLuke', {}, options).then(output => {
  assert.strictEqual(output.name, 'Luke Skywalker')
  assert.strictEqual(output.height, '172')
  console.dir(output, { colors: true })
})
