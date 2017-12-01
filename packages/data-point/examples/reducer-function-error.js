const dataPoint = require('../').create()

const throwError = (acc, next) => {
  // passing first argument will be
  // handled as an error by the transform
  next(new Error('oh noes!!'))
}

dataPoint.transform(throwError, 'Hello').catch(error => {
  console.assert(error instanceof Error)
  console.log(error.toString()) // 'Error: oh noes!!'
})
