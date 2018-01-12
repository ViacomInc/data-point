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
     { name: 'Darth Vader', gender: 'male', birthYear: '41.9BBY' },
     { name: 'Owen Lars', gender: 'male', birthYear: '52BBY' },
     { name: 'Beru Whitesun lars',
       gender: 'female',
       birthYear: '47BBY' },
     { name: 'R5-D4', gender: 'n/a', birthYear: 'unknown' },
     { name: 'Biggs Darklighter', gender: 'male', birthYear: '24BBY' },
     { name: 'Anakin Skywalker',
       gender: 'male',
       birthYear: '41.9BBY' },
     { name: 'Shmi Skywalker', gender: 'female', birthYear: '72BBY' },
     { name: 'Cliegg Lars', gender: 'male', birthYear: '82BBY' } ] }
  */
})
