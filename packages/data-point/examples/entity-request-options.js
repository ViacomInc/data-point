const assert = require('assert')
const mock = require('./entity-request-options.mock')

const DataPoint = require('..')

const c = DataPoint.constant
const dataPoint = DataPoint.create()

dataPoint.addEntities({
  'request:searchPeople': {
    url: 'https://swapi.co/api/people',
    // options is a "ReducerObject", but
    // values at any level can be wrapped
    // as constants (or just wrap the whole
    // object if all the values are static)
    options: {
      'content-type': c('application/json'), // constant
      qs: {
        // get path `searchTerm` from input
        // to dataPoint.resolve
        search: '$searchTerm'
      }
    }
  }
})

// this will mock the remote service
mock()

const input = {
  searchTerm: 'r2'
}

// the second parameter to transform is the input value
dataPoint.resolve('request:searchPeople', input).then(output => {
  assert.strictEqual(output.results[0].name, 'R2-D2')
  console.dir(output, { colors: true })
})
