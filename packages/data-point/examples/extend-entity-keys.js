const dataPoint = require('../').create()
const assert = require('assert')

dataPoint.addEntities({
  'entry:Base': {
    before: acc => {
      return acc.value + 'before'
    },
    after: acc => {
      return acc.value + 'after'
    }
  },

  // extends entry:Base
  'entry:Extended -> entry:Base': {
    // entry:Base's `before` and
    // `after` get merged with
    // this entity
    value: acc => {
      return acc.value + ' value '
    }
  }
})

dataPoint.transform('entry:Extended', '').then(acc => {
  assert.equal(acc.value, 'before value after')
  console.log(acc.value)
})
