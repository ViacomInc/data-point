const dataPoint = require('../').create()
const _ = require('lodash')

const isArray = () => (acc, next) => {
  if (_.isArray(acc.value)) {
    // if the value is valid, then just pass it along
    return next(null, acc.value)
  }

  // notice how we pass this Error object as the FIRST parameter,
  // this tells DataPoint there was an error, and treat it as such.
  next(new Error(`${acc.value} should be an Array`))
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
