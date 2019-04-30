const dataPoint = require('../').create()
const assert = require('assert')
const mockRequests = require('./reducer-conditional-operator.mock')

const people = [
  {
    name: 'Luke Skywalker',
    swapiId: '1'
  },
  {
    name: 'Yoda',
    swapiId: null
  }
]

dataPoint.addEntities({
  'request:getPerson': {
    url: 'https://swapi.co/api/people/{value}'
  },
  'reducer:getPerson': {
    name: '$name',
    // request:getPerson will only
    // be executed if swapiId is
    // not false, null or undefined
    birthYear: '$swapiId | ?request:getPerson | $birth_year'
  }
})

mockRequests()

dataPoint.resolve('reducer:getPerson[]', people).then(output => {
  assert.deepStrictEqual(output, [
    {
      name: 'Luke Skywalker',
      birthYear: '19BBY'
    },
    {
      name: 'Yoda',
      birthYear: undefined
    }
  ])

  console.dir(output, { colors: true })
})
