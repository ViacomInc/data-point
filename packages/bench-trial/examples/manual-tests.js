const assert = require('assert')

const expected = 2

function addsNumbersSync () {
  return 1 + 1
}

function addsNumbersAsync (done) {
  Promise.resolve().then(() => {
    done(null, 1 + 1)
  })
}

module.exports = [
  {
    async: false,
    name: 'addsNumbersSync',
    test: () => assert.deepEqual(addsNumbersSync(), expected),
    benchmark: addsNumbersSync
  },
  {
    async: true,
    name: 'addsNumbersAsync',
    test: done => {
      addsNumbersAsync((e, val) => {
        assert.deepEqual(val, expected)
        done(null)
      })
    },
    benchmark: addsNumbersAsync
  }
]
