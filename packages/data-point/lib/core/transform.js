const _ = require('lodash')
const Promise = require('bluebird')

const Reducer = require('../reducer-types')
const AccumulatorFactory = require('../accumulator/factory')
const { stringifyReducerStack } = require('../reducer-stack')

function getOptions (spec) {
  return _.defaults({}, spec, {
    locals: {}
  })
}

function resolve (manager, reducerSource, value, options) {
  const contextOptions = getOptions(options)
  const accumulator = AccumulatorFactory.create({
    value: value,
    locals: contextOptions.locals,
    trace: contextOptions.trace,
    values: manager.values.getStore()
  })

  const reducer = Reducer.create(reducerSource)
  const stack = contextOptions.debug ? [] : null

  return Reducer.resolve(manager, accumulator, reducer, stack)
}

function transform (manager, reducerSource, value, options, done) {
  return Promise.try(() => resolve(manager, reducerSource, value, options))
    .catch(error => {
      // TODO have an option for whether or not to log the error
      if (error.rstack) {
        error.rstack = stringifyReducerStack(error.rstack)
        console.error(
          `The following reducer failed to execute:\n ${
            error.rstack
          }\nwith the following input:\n${JSON.stringify(
            error.rvalue,
            null,
            2
          )}`
        )
      }
      throw error
    })
    .asCallback(done)
}

module.exports = transform
