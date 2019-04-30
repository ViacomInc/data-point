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
    test: () => assert.deepStrictEqual(addsNumbersSync(), expected),
    benchmark: addsNumbersSync
  },
  {
    async: true,
    name: 'addsNumbersAsync',
    test: done => {
      addsNumbersAsync((e, val) => {
        assert.deepStrictEqual(val, expected)
        done(null)
      })
    },
    benchmark: addsNumbersAsync
  }
]
