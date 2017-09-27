const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'entry:orgInfo': {
    value: 'source:getOrgInfo | hash:OrgInfo'
  },
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value.org}',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    // notice this is an array not a Transform or Object
    pickKeys: ['name', 'blog']
  }
})

// keys came out intact
const expectedResult = {
  name: 'Node.js Foundation',
  blog: 'https://nodejs.org/foundation/'
}

dataPoint.transform('entry:orgInfo', { org: 'nodejs' }).then(acc => {
  console.log(acc.value)
  assert.deepEqual(acc.value, expectedResult)
  /*
  {
    name: 'Node.js Foundation',
    blog: 'https://nodejs.org/foundation/'
  }
  */
})
