const dataPoint = require('../').create()
const nock = require('nock')
const assert = require('assert')

dataPoint.addEntities({
  'request:getRemoteService': {
    url: 'http://remote.test/{value.serviceName}',
    beforeRequest: acc => {
      // acc.value holds reference to request.options
      const options = Object.assign({}, acc.value, {
        headers: {
          'User-Agent': 'DataPoint'
        }
      })

      return options
    }
  }
})

// this will mock the remote service
nock('http://remote.test')
  .get('/my-service')
  .reply(200, {
    ok: true
  })

const expectedResult = {
  ok: true
}

const input = {
  serviceName: 'my-service'
}

dataPoint.transform('request:getRemoteService', input).then(acc => {
  assert.deepEqual(acc.value, expectedResult)
  console.log(acc.value)
})
