const reducers = require('../utils/reducers')

module.exports = {
  'collection:noValue': {
    value: (value, acc, next) => {
      return next(null, 'invalid')
    }
  },
  'collection:ObjectsNotAllowed': {
    value: '$a.b'
  },
  'collection:a.1': {
    value: '$a.d'
  },
  'collection:b.1': {
    value: '$a.d',
    map: '$d1'
  },
  'collection:b.2': {
    value: '$a.b.c',
    map: []
  },
  'collection:c.1': {
    value: '$a.d',
    filter: ['$d1', reducers.isEqualTo(2)]
  },
  'collection:c.2': {
    value: '$a.b.c',
    filter: value => value % 2
  },
  'collection:c.3': {
    value: '$a.b.c',
    filter: []
  },
  'collection:d.1': {
    value: '$a.b.c',
    find: value => value % 2
  },
  'collection:d.2': {
    value: '$a.b.c',
    find: value => value === 0
  },
  'collection:d.3': {
    value: '$a.b.c',
    find: []
  },
  'collection:j.1': {
    value: '$a.d',
    compose: [{ map: '$d1' }]
  },
  'collection:j.2': {
    value: '$a.d',
    compose: [
      { map: ['$d1', reducers.multiplyBy(5)] },
      { find: [reducers.isEqualTo(10)] }
    ]
  },
  'collection:j.3': {
    value: '$a.d',
    compose: [{ find: [reducers.isEqualTo(10)] }, { map: '$d1' }]
  },
  'collection:j.4': {
    value: '$a.d',
    compose: [{ find: [reducers.isEqualTo(10)] }, { find: '$d1' }]
  },
  'collection:j.5': {
    value: '$a.d',
    compose: [{ find: [reducers.isEqualTo(10)] }, { filter: '$d1' }]
  }
}
