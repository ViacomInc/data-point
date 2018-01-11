const _ = require('lodash')
const Promise = require('bluebird')

const Reducer = require('../reducer-types')
const AccumulatorFactory = require('../accumulator/factory')

function getOptions (spec) {
  return _.defaults({}, spec, {
    locals: {}
  })
}

function resolve (manager, reducerSource, value, options) {
  const contextOptions = getOptions(options)
  const context = AccumulatorFactory.create({
    value: value,
    locals: contextOptions.locals,
    trace: contextOptions.trace,
    values: manager.values.getStore()
  })

  const reducer = Reducer.create(reducerSource)

  return Reducer.resolve(manager, context, reducer)
}

function transform (manager, reducerSource, value, options, done) {
  return Promise.resolve()
    .then(() => resolve(manager, reducerSource, value, options))
    .asCallback(done)
}

module.exports = transform
