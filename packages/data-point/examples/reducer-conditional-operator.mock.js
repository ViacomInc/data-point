const nock = require('nock')

module.exports = () => {
  nock('https://swapi.co')
    .get('/api/people/1')
    .reply(200, {
      name: 'Luke Skywalker',
      birth_year: '19BBY'
    })
}
