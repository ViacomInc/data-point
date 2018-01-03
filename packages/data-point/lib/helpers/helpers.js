'use strict'

const _ = require('lodash')
const resolveTransform = require('../transform-expression').resolve
const AccumulatorFactory = require('../accumulator/factory')

const createTransform = require('../transform-expression').create

module.exports.createTransform = createTransform

const createEntity = require('../entity-types/base-entity').create

module.exports.createEntity = createEntity

const resolveEntity = require('../entity-types/base-entity/resolve').resolve

module.exports.resolveEntity = resolveEntity

function createAccumulator (value, options) {
  return AccumulatorFactory.create(
    Object.assign(
      {
        value
      },
      options
    )
  )
}

module.exports.createAccumulator = createAccumulator

function createResolveTransform (dataPoint) {
  return resolveTransform.bind(null, dataPoint)
}

module.exports.createResolveTransform = createResolveTransform

function isTransform (transform) {
  return (
    _.isArray(transform.reducers) && transform.typeOf === 'TransformExpression'
  )
}

module.exports.isTransform = isTransform
