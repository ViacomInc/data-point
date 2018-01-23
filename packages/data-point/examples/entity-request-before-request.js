const dataPoint = require('../').create()
const nock = require('nock')
const assert = require('assert')

dataPoint.addEntities({
  'request:getRemoteService': {
    url: 'http://remote.test/',
    beforeRequest: options => {
      return Object.assign({}, options, {
        headers: {
          'User-Agent': 'DataPoint'
        }
      })
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

dataPoint.resolve('request:getRemoteService', {}).then(output => {
  assert.deepEqual(output, expectedResult)
  console.log(output)
})
