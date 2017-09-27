const reducers = require('../utils/reducers')

module.exports = {
  'source:a0.1': {
    url: 'http://some.path',
    options: {
      dataType: 'json',
      method: 'POST',
      timeout: 1000,
      username: '$username$',
      $password: (acc, next) => next(null, '$password$'),
      qs: {
        $varKey1: (acc, next) => next(null, 'someValue'),
        varKey2: 1,
        varKey3: true
      }
    }
  },
  'source:a1': {
    url: 'http://remote.test/source1'
  },
  'source:a1.0': {
    url: '{values.server}/source1'
  },
  'source:a1.1': {
    url: 'http://remote.test/source2'
  },
  'source:a1.2': {
    url: 'http://remote.test/source3'
  },
  'source:a1.3': {
    url: 'http://remote.test/source4'
  },
  'source:a2': {
    url: 'http://remote.test',
    beforeRequest: (acc, done) => {
      const options = acc.value
      options.url = options.url + '/source1'
      done(null, options)
    }
  },
  'source:a3': {
    url: 'http://remote.test',
    beforeRequest: (acc, done) => {
      const options = acc.value
      options.url = options.url + acc.initialValue.itemPath
      done(null, options)
    }
  },
  'source:a3.2': {
    url: 'http://remote.test{locals.itemPath}'
  },
  'source:a3.3': {
    url: 'http://remote.test{initialValue.itemPath}'
  },
  'source:a4': {
    url: 'source1',
    options: {
      baseUrl: 'http://remote.test'
    }
  },
  'source:a5': {
    url: 'http://remote.test/a5',
    before: reducers.addQueryVar('varKey2', 'someValue2'),
    options: {
      query: {
        varKey1: 'someValue1'
      }
    }
  },
  'source:a6': {
    url: 'http://remote.test/a6',
    after: reducers.addKeyValue('testKey', 'testValue')
  },
  'source:a7.1': {
    url: 'http://remote.test/a7',
    error: reducers.sourceErrorDoNothing()
  },
  'source:a7.2': {
    url: 'http://remote.test/a7',
    error: reducers.sourceErrorGraceful()
  },
  'source:a8.1': {
    url: 'source1',
    options: {
      baseUrl: 'http://remote.test'
    }
  }
}
