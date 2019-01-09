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
          urls: input => {
            return [input.reposUrl, input.eventsUrl]
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

dataPoint.resolve('hash:composeExmple', input).then(output => {
  console.log(output)
  assert.deepStrictEqual(output, expectedResult)
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
