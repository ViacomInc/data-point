const dataPoint = require('../').create()
const assert = require('assert')
const nock = require('nock')

dataPoint.addEntities({
  'request:getRemoteService': {
    url: 'http://remote.test/source'
  }
})

// this will mock the remote service
nock('http://remote.test')
  .get('/source')
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
