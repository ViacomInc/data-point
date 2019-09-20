/* eslint-disable */
/* eslint-disable prettier */

const e1 = {};

// prettier-ignore
e1 = {
  entities: {
    'collection:nested': {
      map: '$b',
      filter: '$a',
      after: () => true
    }
  }
}

const e2 = {};

// prettier-ignore
e2['hash:example'] = {
  'after': () => ({}),
  addKeys: {},
  'error': () => ({}),
  'params': {},
  'omitKeys': ['a', 'b'],
  'before': () => ({}),
  pickKeys: [],
  value: {},
  'mapKeys': () => true,
  'inputType': 'object',
  'addValues': () => ({}),
  'outputType': 'object'
}

// prettier-ignore
const e3 = {
  'collection:example': {
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

const e4 = {};

// should not be changed
e4["collection:example"] = {
  mapKeys: "$a"
};

// should not be changed
const e5 = {
  entities: {
    "hash:example": {
      mapKeys: "$a"
    }
  }
};

// should not be changed
const e6 = {
  "collection:example": {
    before: () => [],
    inputType: "array",
    find: "$find"
  }
};

// should not be changed
// prettier-ignore
const e7 = {
  'hash:example': {
    before: () => [],
    compose: [{
      invalidKey: '$invalidKey'
    }],
    inputType: 'array'
  }
}
