const dataPoint = require('../').create()
const nock = require('nock')
const assert = require('assert')

dataPoint.addEntities({
  'request:getRemoteService': {
    url: 'http://remote.test/',
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
nock('http://remote.test', {
  reqheaders: {
    'User-Agent': 'DataPoint'
  }
})
  .get('/')
  .reply(200, {
    ok: true
  })

const expectedResult = {
  ok: true
}

dataPoint.transform('request:getRemoteService', {}).then(acc => {
  assert.deepEqual(acc.value, expectedResult)
  console.log(acc.value)
})
