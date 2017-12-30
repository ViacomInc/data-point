const dataPoint = require('../').create()

const reducer = {
  x: [
    '$a',
    {
      a: '$a'
    }
  ],
  y: [
    {
      a: '$a'
    },
    '$a'
  ]
}

const data = {
  a: {
    a: 1,
    b: 2
  }
}

dataPoint.transform(reducer, data).then(acc => {
  console.log(acc.value)
})
