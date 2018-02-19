/* eslint-disable */
/* eslint-disable prettier */

const e1 = {}

// prettier-ignore
e1 = {
  entities: {
    'collection:nested': {
      compose: [{
        filter: '$a'
      }, {
        map: '$b'
      }, {
        find: '$c'
      }],

      after: () => true
    }
  }
}

const e2 = {}

// prettier-ignore
e2['hash:options'] = {
  'after': () => ({}),
  'error': () => ({}),
  'params': {},
  'before': () => ({}),
  'value': {},
  'inputType': 'object',

  compose: [{
    'omitKeys': ['a', 'b']
  }, {
    pickKeys: []
  }, {
    'mapKeys': () => true
  }, {
    'addValues': () => ({})
  }, {
    addKeys: {}
  }],

  'outputType': 'object'
}

// prettier-ignore
const e3 = {
  'collection:options': {
    before: () => [],
    outputType: 'array',
    inputType: 'array',
    params: {},
    after: () => [],
    value: '$c',

    compose: [{
      filter: '$filter'
    }, {
      map: '$map'
    }, {
      find: '$find'
    }],

    error: () => []
  }
}

const e4 = {}

// should not be changed
e4['collection:example'] = {
  mapKeys: '$a'
}

// should not be changed
const e5 = {
  entities: {
    'hash:options': {
      mapKeys: '$a'
    }
  }
}

// should not be changed
const e6 = {
  'collection:options': {
    before: () => [],
    inputType: 'array',
    find: '$find'
  }
}

// should not be changed
// prettier-ignore
const e7 = {
  'hash:options': {
    before: () => [],
    compose: [{
      invalidKey: '$invalidKey'
    }],
    inputType: 'array'
  }
}
