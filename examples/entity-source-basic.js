const dataPoint = require('../').create()

dataPoint.addEntities({
  'source:getOrgInfo': {
    url: 'https://api.github.com/orgs/nodejs',
    options: {
      headers: {
        'User-Agent': 'DataPoint'
      }
    }
  }
})

dataPoint.transform('source:getOrgInfo', {}).then(acc => {
  console.log(acc.value) // entire result from https://api.github.com/orgs/nodejs
})
