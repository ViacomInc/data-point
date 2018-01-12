const nock = require('nock')

module.exports = () => {
  nock('https://swapi.co')
    .get('/api/people')
    .query({
      search: 'r2'
    })
    .reply(200, {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          name: 'R2-D2'
        }
      ]
    })
}
