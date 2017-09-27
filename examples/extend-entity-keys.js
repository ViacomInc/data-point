const dataPoint = require('../').create()

dataPoint.addEntities({
  'entry:getReposWithAllTags': {
    value: 'source:repositories'
  },
  'source:githubBase': {
    options: { headers: { 'User-Agent': 'DataPoint' } }
  },
  'source:repositories -> source:githubBase': {
    // options object is provided by source:githubBase
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
