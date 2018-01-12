const nock = require('nock')

module.exports = () => {
  nock('https://swapi.co')
    .get('/api/planets/1')
    .reply(200, {
      name: 'Tatooine',
      rotation_period: '23',
      orbital_period: '304',
      diameter: '10465',
      climate: 'arid',
      gravity: '1 standard',
      terrain: 'desert',
      surface_water: '1',
      population: '200000',
      residents: [
        'https://swapi.co/api/people/1/',
        'https://swapi.co/api/people/2/',
        'https://swapi.co/api/people/4/'
      ]
    })

  nock('https://swapi.co')
    .get('/api/people/1/')
    .reply(200, {
      name: 'Luke Skywalker',
      height: '172',
      mass: '77',
      hair_color: 'blond',
      skin_color: 'fair',
      birth_year: '19BBY',
      gender: 'male'
    })

  nock('https://swapi.co')
    .get('/api/people/2/')
    .reply(200, {
      name: 'C-3PO',
      height: '167',
      mass: '75',
      hair_color: 'n/a',
      skin_color: 'gold',
      eye_color: 'yellow',
      birth_year: '112BBY',
      gender: 'n/a'
    })

  nock('https://swapi.co')
    .get('/api/people/4/')
    .reply(200, {
      name: 'Darth Vader',
      height: '202',
      mass: '136',
      hair_color: 'none',
      skin_color: 'white',
      eye_color: 'yellow',
      birth_year: '41.9BBY',
      gender: 'male'
    })
}
