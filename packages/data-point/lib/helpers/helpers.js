const _ = require('lodash')
const Promise = require('bluebird')
const resolveReducer = require('../reducer-types').resolve
const AccumulatorFactory = require('../accumulator/factory')

const { stubFactories } = require('../reducer-types/reducer-helpers')
const typeCheckFunctionReducers = require('./type-check-functions')

module.exports.helpers = {
  assign: stubFactories.assign,
  constant: stubFactories.constant,
  filter: stubFactories.filter,
  find: stubFactories.find,
  map: stubFactories.map,
  omit: stubFactories.omit,
  parallel: stubFactories.parallel,
  pick: stubFactories.pick,
  withDefault: stubFactories.withDefault,
  isString: typeCheckFunctionReducers.isString,
  isNumber: typeCheckFunctionReducers.isNumber,
  isBoolean: typeCheckFunctionReducers.isBoolean,
  isFunction: typeCheckFunctionReducers.isFunction,
  isError: typeCheckFunctionReducers.isError,
  isArray: typeCheckFunctionReducers.isArray,
  isObject: typeCheckFunctionReducers.isObject
}

const createReducer = require('../reducer-types').create

module.exports.createReducer = createReducer

const createEntity = require('../entity-types/base-entity').create

module.exports.createEntity = _.partial(createEntity, createReducer)

module.exports.resolveEntity = require('../entity-types/base-entity/resolve').resolve

module.exports.isReducer = require('../reducer-types').isReducer

module.exports.validateEntityModifiers = require('../entity-types/validate-modifiers').validateModifiers

function reducify (method) {
  return function () {
    const partialArguments = Array.prototype.slice.call(arguments)
    return function (value) {
      const methodArguments = [value].concat(partialArguments)
      return method.apply(null, methodArguments)
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
  return pcb(acc.value, acc).then(val => ({ value: val }))
}

module.exports.mockReducer = mockReducer

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

function createReducerResolver (dataPoint) {
  return resolveReducer.bind(null, dataPoint)
}

module.exports.createReducerResolver = createReducerResolver
