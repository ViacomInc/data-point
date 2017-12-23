const dataPoint = require('../').create()

const reducer = {
  y: '$x.y',
  zPlusOne: ['$x.y.z', acc => acc.value + 1]
}

const data = {
  x: {
    y: {
      z: 2
    }
  }
}

dataPoint.transform(reducer, data).then(acc => {
  console.log(acc.value)
})
