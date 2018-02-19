/* eslint-disable */
/* eslint-disable prettier */

const e1 = {}

// prettier-ignore
e1 = {
  entities: {
    'collection:nested': {
      map: '$b',
      find: '$c',
      filter: '$a',
      after: () => true
    }
  }
}

const e2 = {}

// prettier-ignore
e2['hash:options'] = {
  'after': () => ({}),
  addKeys: {},
  'error': () => ({}),
  'params': {},
  'omitKeys': ['a', 'b'],
  'before': () => ({}),
  pickKeys: [],
  'value': {},
  'mapKeys': () => true,
  'inputType': 'object',
  'addValues': () => ({}),
  'outputType': 'object'
}

// prettier-ignore
const e3 = {
  'collection:options': {
    before: () => [],
    outputType: 'array',
    inputType: 'array',
    find: '$find',
    filter: '$filter',
    params: {},
    after: () => [],
    map: '$map',
    value: '$c',
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
