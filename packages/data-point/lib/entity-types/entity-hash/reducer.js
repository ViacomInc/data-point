'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const utils = require('../../utils')

function flattenResult (key) {
  return function flatten (result) {
    return {
      key,
      value: result.value
    }
  }
}

function resolveMapKeys (accumulator, modelMap, resolveTransform) {
  const keyPairs = _.toPairs(modelMap)

  // exit if no keys to map
  if (keyPairs.length === 0) {
    return Promise.resolve(accumulator)
  }

  const resolvedMap = Promise.resolve(keyPairs)
    .map(keyPair => {
      const key = keyPair[0]
      const transform = keyPair[1]
      return resolveTransform(accumulator, transform).then(flattenResult(key))
    })
    .then(result => {
      const resultMap = result.reduce((acc, item) => {
        /* eslint no-param-reassign: "off" */
        acc[item.key] = item.value
        return acc
      }, {})

      return resultMap
    })
    .then(result => utils.set(accumulator, 'value', result))

  return resolvedMap
}

function resolveAddValues (accumulator, modelValues) {
  if (Object.keys(modelValues).length === 0) {
    return Promise.resolve(accumulator)
  }

  const value = _.assign({}, accumulator.value, modelValues)
  const resolvedReducer = utils.set(accumulator, 'value', value)
  return Promise.resolve(resolvedReducer)
}

module.exports.resolveAddValues = resolveAddValues

function resolveAddKeys (accumulator, modelExtend, resolveTransform) {
  if (Object.keys(modelExtend).length === 0) {
    return Promise.resolve(accumulator)
  }

  return resolveMapKeys(accumulator, modelExtend, resolveTransform).then(
    result => resolveAddValues(accumulator, result.value)
  )
}

module.exports.resolveAddKeys = resolveAddKeys

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
  return !_.isPlainObject(acc.value)
    ? Promise.reject(
      new Error(
        `"${entity.id}" received acc.value = ${JSON.stringify(
          acc.value
        ).substr(0, 15)} of type ${utils.typeOf(
          acc.value
        )} this entity only process plain Objects. More info https://github.com/ViacomInc/data-point#hash-entity`
      )
    )
    : acc
}

const modifierFunctionMap = {
  mapKeys: resolveMapKeys,
  addKeys: resolveAddKeys,
  addValues: resolveAddValues,
  omitKeys: resolveOmitKeys,
  pickKeys: resolvePickKeys
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
