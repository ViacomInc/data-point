const { test } = require('bench-trial')

const expected = true

function testPromise (done) {
  Promise.resolve(true).then(() => {
    done(null, true)
  })
}

function testSetTimeOut (done) {
  setTimeout(() => {
    done(null, true)
  }, 0)
}

module.exports = [
  {
    async: true,
    name: 'promise',
    test: test(testPromise, expected),
    benchmark: testPromise
  },
  {
    async: true,
    name: 'timeout',
    test: test(testSetTimeOut, expected),
    benchmark: testSetTimeOut
  }
]
