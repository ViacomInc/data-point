/* eslint-env jest */

const DataPoint = require('data-point')
const nock = require('nock')

const PersonByIdRequest = DataPoint.Request('PersonByIdRequest', {
  url: 'https://swapi.co/api/people/{value}/'
})

describe('PersonByIdRequest', () => {
  it('should make a request to swapi api to fetch a person by its id', async () => {
    const dataPoint = DataPoint.create()

    const response = {
      name: 'Obi-Wan Kenobi'
    }

    nock('https://swapi.co')
      .get('/api/people/10/')
      .reply(200, response)

    const result = await dataPoint.resolve(PersonByIdRequest, 10)

    expect(result).toEqual(response)
  })
})
