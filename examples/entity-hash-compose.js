const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'hash:composeExmple': {
    compose: [
      {
        addValues: {
          reposUrl: '/orgs/nodejs/repos',
          eventsUrl: '/orgs/nodejs/events'
        }
      },
      {
        addKeys: {
          urls: (acc, next) => {
            const value = acc.value
            next(null, [value.reposUrl, value.eventsUrl])
          }
        }
      },
      {
        omitKeys: ['reposUrl', 'eventsUrl']
      }
    ]
  }
})

const input = {
  orgName: 'Node.js Foundation'
}

const expectedResult = {
  orgName: 'Node.js Foundation',
  urls: ['/orgs/nodejs/repos', '/orgs/nodejs/events']
}

dataPoint.transform('hash:composeExmple', input).then(acc => {
  console.log(acc.value)
  assert.deepEqual(acc.value, expectedResult)
  /*
  {
    orgName: 'Node.js Foundation',
    urls: [
      '/orgs/nodejs/repos',
      '/orgs/nodejs/events'
    ]
  }
  */
})
