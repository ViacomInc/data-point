'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const utils = require('../../utils')

function resolveMapKeys (accumulator, reducer, resolveTransform) {
  return resolveTransform(accumulator, reducer).then(acc => {
    return utils.set(accumulator, 'value', acc.value)
  })
}

module.exports.resolveMapKeys = resolveMapKeys

function resolveAddKeys (accumulator, reducer, resolveTransform) {
  return resolveTransform(accumulator, reducer).then(acc => {
    return resolveAddValues(accumulator, acc.value)
  })
}

module.exports.resolveAddKeys = resolveAddKeys

function resolveAddValues (accumulator, modelValues) {
  if (Object.keys(modelValues).length === 0) {
    return Promise.resolve(accumulator)
  }
  const value = _.assign({}, accumulator.value, modelValues)
  const resolvedReducer = utils.set(accumulator, 'value', value)
  return Promise.resolve(resolvedReducer)
}

module.exports.resolveAddValues = resolveAddValues

function resolveOmitKeys (accumulator, modelOmit) {
  if (modelOmit.length === 0) {
    return Promise.resolve(accumulator)
  }
  const value = _.omit(accumulator.value, modelOmit)
  const resolvedReducer = utils.set(accumulator, 'value', value)
  return Promise.resolve(resolvedReducer)
}

module.exports.resolveOmitKeys = resolveOmitKeys

function resolvePickKeys (accumulator, modelPick) {
  if (modelPick.length === 0) {
    return Promise.resolve(accumulator)
  }
  const value = _.pick(accumulator.value, modelPick)
  const resolvedReducer = utils.set(accumulator, 'value', value)
  return Promise.resolve(resolvedReducer)
}

module.exports.resolvePickKeys = resolvePickKeys

// NOTE: as expensive as this might be, this is to avoid 'surprises'
function validateAsObject (acc) {
  const entity = acc.reducer.spec
  if (_.isPlainObject(acc.value)) {
    return acc
  }
  return Promise.reject(
    new Error(
      `"${entity.id}" received acc.value = ${JSON.stringify(acc.value).substr(
        0,
        15
      )} of type ${utils.typeOf(
        acc.value
      )} this entity only processes plain Objects. More info https://github.com/ViacomInc/data-point#hash-entity`
    )
  )
}

const modifierFunctionMap = {
  omitKeys: resolveOmitKeys,
  pickKeys: resolvePickKeys,
  mapKeys: resolveMapKeys,
  addValues: resolveAddValues,
  addKeys: resolveAddKeys
}

function resolveCompose (accumulator, composeReducers, resolveTransform) {
  if (composeReducers.length === 0) {
    return Promise.resolve(accumulator)
  }

  return Promise.reduce(
    composeReducers,
    (resultContext, modifierSpec) => {
      const modifierFunction = modifierFunctionMap[modifierSpec.type]
      return modifierFunction(
        resultContext,
        modifierSpec.transform,
        resolveTransform
      )
    },
    accumulator
  )
}

function resolve (acc, resolveTransform) {
  const entity = acc.reducer.spec

  // if there is nothing to do, lets just move on
  if (typeof acc.value === 'undefined' || acc.value === null) {
    return Promise.resolve(acc)
  }

  return resolveTransform(acc, entity.value)
    .then(itemContext => validateAsObject(itemContext))
    .then(acc => resolveCompose(acc, entity.compose, resolveTransform))
}

module.exports.resolve = resolve
