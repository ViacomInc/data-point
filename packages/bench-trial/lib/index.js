const assert = require('assert')

function testSync (method, expected) {
  return () => assert.deepStrictEqual(method(), expected)
}

function testAsync (method, expected) {
  return done => {
    return method((err, value) => {
      if (err) {
        return done(err)
      }
      try {
        assert.deepStrictEqual(value, expected)
        done(null, value)
      } catch (e) {
        done(e)
      }
    })
  }
}

function test (method, expected) {
  return {
    test: method,
    expected
  }
}

test.sync = testSync
test.async = testAsync

function benchmarkSync (method) {
  return method
}

function benchmarkAsync (method) {
  return deferred => {
    return method((err, value) => {
      if (err) {
        throw err
      }
      deferred.resolve()
    })
  }
}

module.exports = {
  test,
  benchmark: {
    sync: benchmarkSync,
    async: benchmarkAsync
  }
}
