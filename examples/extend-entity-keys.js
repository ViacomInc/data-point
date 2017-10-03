const dataPoint = require('../').create()

dataPoint.addEntities({
  'entry:getReposWithAllTags': {
    value: 'request:repositories'
  },
  'request:githubBase': {
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'request:repositories -> request:githubBase': {
    // options object is provided by request:githubBase
    url: 'https://api.github.com/orgs/{locals.orgName}/repos'
  }
})

const options = {
  locals: {
    orgName: 'nodejs'
  }
}

dataPoint.transform('entry:getReposWithAllTags', null, options).then(acc => {
  console.log(acc.value)
})
