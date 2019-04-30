const assert = require('assert')
const mocks = require('./async-example.mocks')
const DataPoint = require('../')
const dataPoint = DataPoint.create()

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
        residents: ['$residents', DataPoint.map('model:Resident')]
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

dataPoint.resolve('model:Planet', input).then(output => {
  assert.strictEqual(output.name, 'Tatooine')
  assert.strictEqual(output.population, '200000')
  assert.ok(output.residents.length > 0)

  assert.deepStrictEqual(output.residents[0], {
    name: 'Luke Skywalker',
    gender: 'male',
    birthYear: '19BBY'
  })

  console.dir(output, { colors: true })

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
