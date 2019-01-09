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

dataPoint.resolve('hash:helloWorld', input).then(output => {
  assert.deepStrictEqual(output, {
    c: 'Hello',
    d: ' World!!'
  })
  console.log('result:', output)
  // result: { c: 'Hello', d: ' World!!' }
})
