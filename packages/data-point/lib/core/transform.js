'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const Reducer = require('../reducer')
const AccumulatorFactory = require('../accumulator/factory')

/**
 * @param {Object} spec
 * @returns {Object}
 */
function getOptions (spec) {
  return _.defaults({}, spec, {
    locals: {}
  })
}

/**
 * @param {Object} manager
 * @param {*} reducerSource
 * @param {*} value
 * @param {Object} options
 * @returns {Promise}
 */
function resolve (manager, reducerSource, value, options) {
  const contextOptions = getOptions(options)
  const context = AccumulatorFactory.create({
    value: value,
    locals: contextOptions.locals,
    trace: contextOptions.trace,
    values: manager.values.getStore()
  })

  const transform = Reducer.create(reducerSource)

  return Reducer.resolve(manager, context, transform)
}

/**
 * @param {Object} manager
 * @param {*} reducerSource
 * @param {*} value
 * @param {Object} options
 * @param {Function} done
 * @returns {Promise}
 */
function transform (manager, reducerSource, value, options, done) {
  return Promise.resolve()
    .then(() => resolve(manager, reducerSource, value, options))
    .asCallback(done)
}

module.exports = transform
