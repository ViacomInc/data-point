const DataPoint = require('../')

const dataPoint = DataPoint.create()

// Reducer function that appends
// 'World' to the value of the
// accumulator
const reducer = acc => {
  return acc.value + ' World'
}

// applies reducer to input
dataPoint.transform(reducer, 'Hello').then(acc => {
  // 'Hello World'
  console.log(acc.value)
})
