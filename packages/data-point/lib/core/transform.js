'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const AccumulatorFactory = require('../accumulator/factory')
const TransformExpression = require('../transform-expression')
const reducer = require('../resolve/reducer')

function getOptions (spec) {
  return _.defaults({}, spec, {
    locals: {}
  })
}

function resolve (manager, transformSource, value, options) {
  const values = manager.values.getStore()

  const contextOptions = getOptions(options)

  const context = AccumulatorFactory.create({
    value: _.defaults(value, {}),
    locals: contextOptions.locals,
    trace: contextOptions.trace,
    values
  })

  const transform = TransformExpression.create(transformSource)

  return reducer.resolve(manager, context, transform)
}

function transform (manager, transformSource, value, options, done) {
  return Promise.resolve()
    .then(() => resolve(manager, transformSource, value, options))
    .asCallback(done)
}

module.exports = transform
