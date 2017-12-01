const dataPoint = require('../').create()
const assert = require('assert')

const input = {
  a: {
    b: {
      c: 'Hello',
      d: ' World!!'
    }
  }
}

dataPoint.addEntities({
  'hash:helloWorld': {
    value: '$a.b'
  }
})

dataPoint.transform('hash:helloWorld', input).then(acc => {
  assert.deepEqual(acc.value, {
    c: 'Hello',
    d: ' World!!'
  })
  console.log('result:', acc.value)
  // result: { c: 'Hello', d: ' World!!' }
})
