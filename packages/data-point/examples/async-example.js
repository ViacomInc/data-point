const assert = require('assert')
const mocks = require('./async-example.mocks')
const DataPoint = require('../')
const dataPoint = DataPoint.create()
const { map } = DataPoint.helpers

dataPoint.addEntities({
  // remote service request
  'request:Planet': {
    // {value.planetId} injects the
    // value from the accumulator
    // creates: https://swapi.co/api/planets/1/
    url: 'https://swapi.co/api/planets/{value.planetId}'
  },

  // model entity to resolve a Planet
  'model:Planet': {
    inputType: 'schema:DataInput',
    value: [
      // hit request:Planet data source
      'request:Planet',
      // map result to ObjectReducer
      {
        // map name key
        name: '$name',
        population: '$population',
        // residents is an array of urls
        // eg. https://swapi.co/api/people/1/
        // where each url gets mapped
        // to a model:Resident
        residents: ['$residents', map('model:Resident')]
      }
    ]
  },

  // model entity to resolve a Planet
  'model:Resident': {
    inputType: 'string',
    value: [
      // hit request:Resident
      'request:Resident',
      // extract data
      {
        name: '$name',
        gender: '$gender',
        birthYear: '$birth_year'
      }
    ]
  },

  'request:Resident': {
    // check input is string
    inputType: 'string',
    url: '{value}'
  },

  // schema to verify data input
  'schema:DataInput': {
    schema: {
      type: 'object',
      properties: {
        planetId: {
          $id: '/properties/planet',
          type: 'integer'
        }
      }
    }
  }
})

const input = {
  planetId: 1
}

// mock actual calls to server
mocks()

dataPoint.transform('model:Planet', input).then(acc => {
  const result = acc.value
  assert.equal(result.name, 'Tatooine')
  assert.equal(result.population, '200000')
  assert.ok(result.residents.length > 0)

  assert.deepEqual(result.residents[0], {
    name: 'Luke Skywalker',
    gender: 'male',
    birthYear: '19BBY'
  })

  console.dir(acc.value, { colors: true })

  /*
  { name: 'Tatooine',
  population: '200000',
  residents:
   [ { name: 'Luke Skywalker', gender: 'male', birthYear: '19BBY' },
     { name: 'C-3PO', gender: 'n/a', birthYear: '112BBY' },
     { name: 'Darth Vader', gender: 'male', birthYear: '41.9BBY' }
     ...
  }
  */
})
