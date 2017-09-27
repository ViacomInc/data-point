const dataPoint = require('../').create()

dataPoint.addEntities({
  'source:Planet': {
    url: 'https://swapi.co/api/planets/{value.planetId}'
  },

  'hash:Planet': {
    value: 'source:Planet',
    mapKeys: {
      name: '$name',
      population: '$population',
      residents: '$residents | hash:Resident[]'
    }
  },

  'source:Resident': {
    url: '{value}'
  },

  'hash:Resident': {
    value: 'source:Resident',
    mapKeys: {
      name: '$name',
      gender: '$gender',
      birthYear: '$birth_year'
    }
  }
})

const data = {
  planetId: 1
}

dataPoint.transform('hash:Planet', data).then(acc => {
  console.log(acc.value)
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
