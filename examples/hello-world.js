const DataPoint = require('../')

const dataPoint = DataPoint.create()

// Reducer function that appends 'World' to the
// value of the accumulator
const reducer = (acc, next) => {
  next(null, acc.value + ' World')
}

// applies reducer to input
dataPoint.transform(reducer, 'Hello').then(acc => {
  console.log(acc.value) // 'Hello World'
})
