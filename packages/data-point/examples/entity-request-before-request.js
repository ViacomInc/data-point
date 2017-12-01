const dataPoint = require('../').create()
const _ = require('lodash')

dataPoint.addEntities({
  'request:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value}',
    beforeRequest: acc => {
      // acc.value holds reference to request.options
      const options = _.assign({}, acc.value, {
        headers: {
          'User-Agent': 'DataPoint'
        }
      })

      return options
    }
  }
})

dataPoint.transform('request:getOrgInfo', 'nodejs').then(acc => {
  console.log(acc.value)
  // entire result from https://api.github.com/orgs/nodejs
})
