const assert = require('assert')
const mock = require('./entity-request-options.mock')

const DataPoint = require('..')

const c = DataPoint.helpers.constant
const dataPoint = DataPoint.create()

dataPoint.addEntities({
  'request:searchPeople': {
    url: 'https://swapi.co/api/people',
    // options is a "ReducerObject", but
    // values at any level can be wrapped
    // as constants (or just wrap the whole
    // object if all the values are static!)
    options: {
      method: '$method', // reducer
      'content-type': c('application/json'), // constant
      qs: {
        search: c('r2') // constant
      }
    }
  }
})

// this will mock the remote service
mock()

// the second parameter to transform is the input value
dataPoint
  .transform('request:searchPeople', {
    method: 'GET'
  })
  .then(acc => {
    assert.equal(acc.value.results[0].name, 'R2-D2')
    console.dir(acc.value, { colors: true })
  })
