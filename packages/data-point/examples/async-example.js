const assert = require('assert')
const mocks = require('./async-example.mocks')

const DataPoint = require('../')
const dataPoint = DataPoint.create()
const { map } = DataPoint.helpers

dataPoint.addEntities({
  'request:Planet': {
    // creates: https://swapi.co/api/people/1/
    url: 'https://swapi.co/api/planets/{value.planetId}'
  },

  'hash:Planet': {
    value: 'request:Planet',
    mapKeys: {
      name: '$name',
      population: '$population',
      residents: [
        '$residents',
        map([
          'request:Resident',
          {
            name: '$name',
            gender: '$gender',
            birthYear: '$birth_year'
          }
        ])
      ]
    }
  },

  'request:Resident': {
    url: '{value}'
  }
})

const input = {
  planetId: 1
}

// mock actual calls to server
mocks()

dataPoint.transform('hash:Planet', input).then(acc => {
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
