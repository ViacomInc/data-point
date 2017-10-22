const dataPoint = require('../').create()

const logError = () => (errCtx, next) => {
  // errCtx.value holds the actual value
  console.log(errCtx.value.toString())

  // if we wish to bubble it up, then pass it to
  // the next() as the first parameter
  next(errCtx.value)

  // if we wished not to bubble it, we could pass
  // an empty first param, and a second value to
  // be used as the final resolved value
  // next(null, 30) <-- this is just an example
}

const isArray = () => acc => {
  if (!(acc.value instanceof Array)) {
    throw new Error(`${acc.value} should be an Array`)
  }

  return acc.value
}

dataPoint.addEntities({
  'entry:foo': {
    value: '$a',
    after: isArray(),
    error: logError()
  }
})

const input = {
  a: {
    b: [3, 15, 6, 3, 8]
  }
}

dataPoint.transform('entry:foo', input).catch(error => {
  console.log('got ya!', error.toString())
  // got ya! Error: [object Object] should be an Array
})
