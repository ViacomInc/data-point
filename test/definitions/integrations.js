const reducers = require('../utils/reducers')

module.exports = {
  'hash:branchLeafNesting': {
    value: '$a.f | hash:branchLeaf'
  },
  'hash:branchLeaf': {
    value: '$.',
    mapKeys: {
      label: '$text',
      // using Collection map []
      leafs: '$children | hash:branchLeaf[]'
    }
  },
  'entry:callSource': {
    // entry:a1
    value: 'source:hardcodedUrl1',
    params: {
      ttl: '2d'
    }
  },
  'source:hardcodedUrl1': {
    url: 'http://remote.test/source1'
  },
  'source:hardcodedUrl2': {
    url: 'http://remote.test/source2'
  },

  'entry:callDynamicSourceFromLocals': {
    // entry:a2
    value: 'source:dynamicSourceFromLocals'
  },
  'source:dynamicSourceFromLocals': {
    url: 'http://remote.test{locals.itemPath}'
  },

  'entry:hashThatCallsSource': {
    // entry:a3
    value: 'hash:callHardCodedSource'
  },
  'hash:callHardCodedSource': {
    value: 'source:hardcodedUrl1'
  },

  'entry:callHashWithSourceAndExtendResult': {
    // entry:a4
    value: 'hash:callSourceExtendResult'
  },
  'hash:callSourceExtendResult': {
    value: 'source:hardcodedUrl1',
    addKeys: {
      newOk: ['$ok', reducers.addString('ok')]
    }
  },

  'entry:callHashThatCallsMultipleSources': {
    // entry:a5
    value: 'hash:callMultipleSources'
  },
  'hash:callMultipleSources': {
    addKeys: {
      s1: ['source:hardcodedUrl1', reducers.getKeyValue('source')],
      s2: ['source:hardcodedUrl2', reducers.getKeyValue('source')]
    }
  },

  'entry:nestedSources': {
    value: 'collection:nestedSources'
  },
  'collection:nestedSources': {
    before: 'source:hardcodedUrl1',
    value: '$sources',
    map: 'source:useContextPathData'
  },
  'source:useContextPathData': {
    url: 'http://remote.test{initialValue.itemPath}'
  },
  'schema:checkHashSchemaInvalid': {
    value: 'hash:getSchemaData1',
    schema: {
      type: 'object',
      properties: {
        e2: {
          type: 'number'
        }
      },
      required: ['e2']
    },
    options: {
      v5: false
    }
  },
  'hash:getSchemaData1': {
    value: '$a.e.e1'
  },

  'schema:checkHashSchemaValid': {
    value: 'hash:getSchemaData1',
    schema: {
      type: 'object',
      properties: {
        e2: {
          type: 'string'
        }
      },
      required: ['e2']
    },
    options: {
      v5: false
    }
  },
  'hash:base': {
    value: '$base',
    params: {
      base: true
    },
    after: '$after'
  },
  'hash:extendA -> hash:base': {
    value: '$a'
  },
  'hash:extendB -> hash:base': {
    value: '$b',
    params: {
      extendB: true
    }
  },
  'hash:extendC -> hash:extendB': {
    before: '$before'
  },
  'model:tracedViaOptions': {
    value: '$a.b.c'
  },
  'model:tracedViaParams': {
    value: '$a.b.c',
    params: {
      trace: true
    }
  }
}
