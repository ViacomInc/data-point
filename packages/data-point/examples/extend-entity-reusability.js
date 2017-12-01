const dataPoint = require('../').create()

dataPoint.addEntities({
  'hash:multiply': {
    mapKeys: {
      multiplyByFactor: '$multiplier | model:multiplyBy',
      multiplyBy20: '$multiplier | model:multiplyBy20'
    }
  },
  'model:multiplyBy': {
    value: acc => acc.value * acc.params.multiplicand,
    params: {
      multiplicand: 1
    }
  },
  'model:multiplyBy20 -> model:multiplyBy': {
    // through the params property we can
    // parametrize the base entity
    params: {
      multiplicand: 20
    }
  }
})

dataPoint.transform('hash:multiply', { multiplier: 5 }).then(acc => {
  console.log(acc.value)
  /*
  {
    multiplyByFactor: 5,
    multiplyBy20: 100
  }
  */
})
