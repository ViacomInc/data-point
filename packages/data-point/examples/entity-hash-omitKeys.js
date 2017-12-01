const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'entry:orgInfo': {
    value: 'request:getOrgInfo | hash:OrgInfo'
  },
  'request:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value.org}',
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'hash:OrgInfo': {
    // notice this is an array not a Transform or Object
    omitKeys: [
      'repos_url',
      'events_url',
      'hooks_url',
      'issues_url',
      'members_url',
      'public_members_url',
      'avatar_url',
      'description',
      'name',
      'company',
      'blog',
      'location',
      'email',
      'has_organization_projects',
      'has_repository_projects',
      'public_repos',
      'public_gists',
      'followers',
      'following',
      'html_url',
      'created_at',
      'updated_at',
      'type'
    ]
  }
})

// keys came out intact
const expectedResult = {
  login: 'nodejs',
  id: 9950313,
  url: 'https://api.github.com/orgs/nodejs'
}

dataPoint.transform('entry:orgInfo', { org: 'nodejs' }).then(acc => {
  console.log(acc.value)
  assert.deepEqual(acc.value, expectedResult)
  /*
  {
    login: 'nodejs',
    id: 9950313,
    url: 'https://api.github.com/orgs/nodejs'
  }
  */
})
