const dataPoint = require('data-point').create()

dataPoint.addEntities({
  'request:Planet': {
    url: 'https://swapi.co/api/planets/{value}'
  }
})

const objectReducer = {
  tatooine: ['$tatooine', 'request:Planet'],
  alderaan: ['$alderaan', 'request:Planet']
}

const planetIds = {
  tatooine: 1,
  alderaan: 2
}

dataPoint.transform(objectReducer, planetIds)
  .then(acc => {
    // do something with the planet data!
  })
