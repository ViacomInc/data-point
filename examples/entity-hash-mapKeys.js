const dataPoint = require('../').create()

dataPoint.addEntities({
  'source:getOrgInfo': {
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
  }
})

dataPoint.transform('source:getOrgInfo | hash:OrgInfo').then(acc => {
  console.log(acc.value)
  // {
  //  reposUrl: 'https://api.github.com/orgs/nodejs/repos',
  //  eventsUrl: 'https://api.github.com/orgs/nodejs/events',
  //  avatarUrl: 'https://avatars0.githubusercontent.com/u/9950313?v=3',
  //  orgName: 'Node.js Foundation',
  //  blogUrl: 'https://nodejs.org/foundation/'
  // }
})
