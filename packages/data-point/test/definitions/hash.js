const reducers = require('../utils/reducers')

module.exports = {
  'hash:noValue': {
    value: (value, acc, next) => {
      return next(null, 'invalid')
    }
  },
  'hash:arraysNotAllowed': {
    value: '$a.b.c'
  },
  'hash:asIs': {
    value: '$'
  },
  'hash:a.1': {
    value: '$a.h'
  },
  'hash:b.1': {
    value: '$a.h',
    mapKeys: {
      h: ['$h1', reducers.multiplyBy(2)]
    }
  },
  'hash:b.2': {
    value: '$a.g',
    mapKeys: {}
  },
  'hash:c.1': {
    value: '$a.h',
    addKeys: {
      h4: ['$h1', reducers.multiplyBy(4)]
    }
  },
  'hash:c.2': {
    value: '$a.g',
    addKeys: {}
  },
  'hash:d.1': {
    value: '$a.h',
    omitKeys: ['h1', 'h2']
  },
  'hash:d.2': {
    value: '$a.g',
    omitKeys: []
  },
  'hash:e.1': {
    value: '$a.h',
    pickKeys: ['h1', 'h2']
  },
  'hash:e.2': {
    value: '$a.g',
    pickKeys: []
  },
  'hash:f.1': {
    value: '$a.h',
    addValues: {
      h0: 0
    }
  },
  'hash:f.2': {
    value: '$a.g',
    addValues: {}
  },
  'hash:g.1': {
    value: '$a.g',
    mapKeys: {
      g: ['$g2', reducers.multiplyBy(2)]
    },
    addValues: {
      g4: 4
    },
    addKeys: {
      g4: ['$g1', reducers.multiplyBy(4)]
    }
  },
  'hash:h.1': {
    value: '$a.e.e1',
    compose: [
      {
        addValues: {
          e3: 'eThree'
        }
      },
      {
        pickKeys: ['e3']
      }
    ]
  }
}
