const dataPoint = require('../').create()
const _ = require('lodash')

const isArray = () => acc => {
  if (_.isArray(acc.value)) {
    // if the value is valid, then just pass it along
    return acc.value
  }

  throw new Error(`${acc.value} should be an Array`)
}

dataPoint.addEntities({
  'entry:foo': {
    before: isArray(),
    value: '$.'
  }
})

dataPoint.transform('entry:foo', [3, 15, 6, 3, 8]).then(acc => {
  console.log(acc.value)
  // [ 3, 15, 6, 3, 8 ]
})
