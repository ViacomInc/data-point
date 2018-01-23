const dataPoint = require('../').create()
const assert = require('assert')
const mock = require('./entity-request-transform-object.mock')

dataPoint.addEntities({
  'request:searchPeople': {
    url: 'https://swapi.co/api/people',
    options: {
      qs: {
        // because the key starts with $
        // it will be treated as a reducer
        $search: '$personName'
      }
    }
  }
})

// this will mock the remote service
mock()

// second parameter to transform is the initial acc value
dataPoint
  .resolve('request:searchPeople', {
    personName: 'r2'
  })
  .then(output => {
    assert.equal(output.results[0].name, 'R2-D2')
    console.dir(output, { colors: true })
  })
