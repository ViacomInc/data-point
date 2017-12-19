const dataPoint = require('data-point').create()

dataPoint.addEntities({
  'transform:one': acc => 'ok'
})

dataPoint.transform('transform:one', null).then(acc => console.log(acc.value))

// dataPoint.transform('$a.b', null).then(acc => console.log(acc.value))
