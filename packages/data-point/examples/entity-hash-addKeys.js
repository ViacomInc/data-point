const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'entry:orgInfo': {
    value: 'request:getOrgInfo | hash:OrgInfo | hash:OrgInfoCustom'
  },
  'request:getOrgInfo': {
    url: 'https://api.github.com/orgs/nodejs',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    mapKeys: {
      reposUrl: '$repos_url',
      eventsUrl: '$events_url',
      avatarUrl: '$avatar_url',
      orgName: '$name',
      blogUrl: '$blog'
    }
  },
  'hash:OrgInfoCustom': {
    addKeys: {
      // notice we are extracting from the new key
      // made on the hash:OrgInfo entity
      avatarUrlDuplicate: '$avatarUrl'
    }
  }
})

const expectedResult = {
  reposUrl: 'https://api.github.com/orgs/nodejs/repos',
  eventsUrl: 'https://api.github.com/orgs/nodejs/events',
  avatarUrl: 'https://avatars0.githubusercontent.com/u/9950313?v=3',
  orgName: 'Node.js Foundation',
  blogUrl: 'https://nodejs.org/foundation/',
  // this key was added through hash:OrgInfoCustom
  avatarUrlDuplicate: 'https://avatars0.githubusercontent.com/u/9950313?v=3'
}

dataPoint.transform('entry:orgInfo', { org: 'nodejs' }).then(acc => {
  assert.deepEqual(acc.value, expectedResult)
  console.log(acc.value)
  /*
  {
    reposUrl: 'https://api.github.com/orgs/nodejs/repos',
    eventsUrl: 'https://api.github.com/orgs/nodejs/events',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/9950313?v=3',
    orgName: 'Node.js Foundation',
    blogUrl: 'https://nodejs.org/foundation/',
    avatarUrlDuplicate: 'https://avatars0.githubusercontent.com/u/9950313?v=3'
  }
  */
})
