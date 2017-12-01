'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const resolve = require('../resolve/reducer').resolve
const AccumulatorFactory = require('../accumulator/factory')
const deepFreeze = require('deep-freeze')

function reducify (method) {
  return function () {
    const partialArguments = Array.prototype.slice.call(arguments)
    return function (acc, done) {
      const methodArguments = [acc.value].concat(partialArguments)
      const result = method.apply(null, methodArguments)
      if (_.isError(result)) {
        return done(result)
      }
      done(null, result)
    }
  }
}

module.exports.reducify = reducify

function reducifyAll (source, methodList) {
  let target = source
  if (!_.isEmpty(methodList)) {
    target = _.pick(source, methodList)
  }
  return _.mapValues(target, reducify)
}

module.exports.reducifyAll = reducifyAll

function mockReducer (reducer, acc) {
  const pcb = Promise.promisify(reducer)
  return pcb(acc).then(val => ({ value: val }))
}

module.exports.mockReducer = mockReducer

const createTransform = require('../transform-expression').create
module.exports.createTransform = createTransform

const resolveEntity = require('../entity-types/resolve-entity')
module.exports.resolveEntity = resolveEntity

/**
 * @param {function} Factory - factory function to create the entity
 * @param {Object} spec - spec for the Entity
 */
function createEntity (Factory, spec) {
  const entity = new Factory(spec)

  entity.id = spec.id
  entity.value = createTransform(spec.value)
  entity.before = createTransform(spec.before)
  entity.error = createTransform(spec.error)
  entity.after = createTransform(spec.after)
  entity.params = deepFreeze(_.defaultTo(spec.params, {}))

  return entity
}

module.exports.createEntity = createEntity

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
  return resolve.bind(null, dataPoint)
}
module.exports.createResolveTransform = createResolveTransform

function isTransform (transform) {
  return (
    _.isArray(transform.reducers) && transform.typeOf === 'TransformExpression'
  )
}
module.exports.isTransform = isTransform
