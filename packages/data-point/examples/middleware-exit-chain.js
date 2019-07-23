const assert = require('assert')
const DataPoint = require('data-point')
const dp = DataPoint.create()

dp.use('before', (acc, next) => {
  console.log('Entity model:MyModel is being called')
  next()
})

dp.use('before', (acc, next) => {
  console.log('hijacking')
  next(null, 'hijacked')
})

dp.use('before', (acc, next) => {
  console.log('never got here')
  next()
})

const MyModel = DataPoint.Model('MyModel', {
  value: () => {
    // this will not be executed because the entity was hijacked
    console.log('processing')
    return 'hello'
  }
})

dp.resolve(MyModel, true)
  // console output:
  // Entity model:MyModel is being called
  // hijacking
  .then(value => {
    assert.strictEqual(value, 'hijacked')
  })
