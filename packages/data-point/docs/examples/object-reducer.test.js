/* eslint-env jest */

const DataPoint = require('data-point')

function getMonth (rawDate) {
  const date = new Date(rawDate)
  return date.getMonth() + 1
}

const Card = {
  id: '$uid',
  title: '$shortTitle',
  monthCreated: ['$dateCreated', getMonth]
}

// getMonth unit tests are omitted for the purpose of the example

describe('Card Object Reducer', () => {
  it('should create Card Object', async () => {
    const dataPoint = DataPoint.create()

    const input = {
      uid: 123,
      shortTitle: 'Some Title',
      dateCreated: '2018-12-04T03:24:00'
    }

    const result = await dataPoint.resolve(Card, input)

    expect(result).toEqual({
      id: 123,
      title: 'Some Title',
      monthCreated: 12
    })
  })
})
