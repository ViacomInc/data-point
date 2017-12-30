const dataPoint = require('../').create()

const reducer = {
  x: '$c.x',
  y: '$c.y',
  z: {
    a: '$a',
    b: '$b'
  }
}

const data = {
  a: 'A',
  b: 'B',
  c: {
    x: 'X',
    y: 'Y'
  }
}

dataPoint.transform(reducer, data).then(acc => {
  console.log(acc.value)
})
