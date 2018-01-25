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

dataPoint.resolve(reducer, data).then(output => {
  console.log(output)
})
