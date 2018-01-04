const dataPoint = require('../').create()

dataPoint.addEntities({
  'request:getOrgInfo': {
    url: 'https://api.github.com/orgs/{value}',
    options: {
      headers: {
        'User-Agent': 'DataPoint'
      }
    }
  },

  'request:getOrgInfoFromObject': {
    // notice here dot notation to get the value of name
    url: 'https://api.github.com/orgs/{value.org.name}',
    options: {
      headers: {
        'User-Agent': 'DataPoint'
      }
    }
  },

  'request:getOrgInfoFromLocals': {
    // notice here dot notation to get the value of name from locals
    url: 'https://api.github.com/orgs/{locals.name}',
    options: {
      headers: {
        'User-Agent': 'DataPoint'
      }
    }
  }
})

dataPoint.transform('request:getOrgInfo', 'nodejs').then(acc => {
  console.log(acc.value)
  // entire result from https://api.github.com/orgs/nodejs
})

// here we pass an Object as the input value
dataPoint
  .transform('request:getOrgInfoFromObject', { org: { name: 'nodejs' } })
  .then(acc => {
    console.log(acc.value)
    // entire result from https://api.github.com/orgs/nodejs
  })

const options = {
  locals: { name: 'nodejs' }
}

// here we pass options (third argument to transform)
dataPoint.transform('request:getOrgInfoFromLocals', true, options).then(acc => {
  console.log(acc.value)
  // entire result from https://api.github.com/orgs/nodejs
})
