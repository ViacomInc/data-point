const reducers = require('../utils/reducers')

module.exports = {
  'hash:branchLeafNesting': {
    value: '$a.f | hash:branchLeaf'
  },
  'hash:branchLeaf': {
    value: '$',
    mapKeys: {
      label: '$text',
      // using Collection map []
      leafs: '$children | hash:branchLeaf[]'
    }
  },
  'entry:callRequest': {
    // entry:a1
    value: 'request:hardcodedUrl1',
    params: {
      ttl: '2d'
    }
  },
  'request:hardcodedUrl1': {
    url: 'http://remote.test/source1'
  },
  'request:hardcodedUrl2': {
    url: 'http://remote.test/source2'
  },

  'entry:callDynamicRequestFromLocals': {
    // entry:a2
    value: 'request:dynamicRequestFromLocals'
  },
  'request:dynamicRequestFromLocals': {
    url: 'http://remote.test{locals.itemPath}'
  },

  'entry:hashThatCallsRequest': {
    // entry:a3
    value: 'hash:callHardCodedRequest'
  },
  'hash:callHardCodedRequest': {
    value: 'request:hardcodedUrl1'
  },

  'entry:callHashWithRequestAndExtendResult': {
    // entry:a4
    value: 'hash:callRequestExtendResult'
  },
  'hash:callRequestExtendResult': {
    value: 'request:hardcodedUrl1',
    addKeys: {
      newOk: ['$ok', reducers.addString('ok')]
    }
  },

  'entry:callHashThatCallsMultipleRequests': {
    // entry:a5
    value: 'hash:callMultipleRequests'
  },
  'hash:callMultipleRequests': {
    addKeys: {
      s1: ['request:hardcodedUrl1', reducers.getKeyValue('source')],
      s2: ['request:hardcodedUrl2', reducers.getKeyValue('source')]
    }
  },

  'entry:nestedRequests': {
    value: 'collection:nestedRequests'
  },
  'collection:nestedRequests': {
    before: 'request:hardcodedUrl1',
    value: '$sources',
    map: 'request:useContextPathData'
  },
  'request:useContextPathData': {
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
