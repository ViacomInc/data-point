module.exports = {
  'transform:HelloWorld': () => {
    return 'Hello World!!'
  },
  'transform:greet': acc => {
    return `Hello ${acc.locals.params.name}!!`
  },
  'entry:getPerson': {
    before: acc => {
      // check params is not missing
      if (!acc.locals.params.personId) {
        throw new Error('missing params.personId')
      }
    },
    value: '$..locals.params.personId | request:getPersonById | hash:Person',
    params: {
      ttl: '5m',
      cacheKey: acc => `entry:getPerson:${acc.locals.params.personId}`
    }
  },
  'request:getPersonById': {
    url: 'https://swapi.co/api/people/{value}'
  },
  'request:getHomeWorldByUrl': {
    url: '{value}'
  },
  'model:getHomeWorldByUrl': {
    value: 'request:getHomeWorldByUrl | $name'
  },
  'hash:Person': {
    mapKeys: {
      name: '$name',
      gender: '$gender',
      hairColor: '$hair_color',
      homeworld: '$homeworld | model:getHomeWorldByUrl'
    }
  }
}
