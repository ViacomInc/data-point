const DataPoint = require('data-point')
const mocks = require('./async-example.mocks')

// mock request calls
mocks()

const { Model, Request } = DataPoint.entities

const PersonRequest = Request('PersonRequest', {
  url: 'https://swapi.co/api/people/{value}/'
})

const PersonModel = Model('PersonModel', {
  value: {
    name: '$name',
    birthYear: '$birth_year'
  }
})

const options = {
  trace: false // <-- set to true to enable tracing, a file will be created
}

const dataPoint = DataPoint.create()

dataPoint.transform([PersonRequest, PersonModel], 1, options).then(output => {
  // a file with the name data-point-trace-<timestamp>.json will
  // be created.
})
