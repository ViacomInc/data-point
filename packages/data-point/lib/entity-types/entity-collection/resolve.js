'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const utils = require('../../utils')
const Util = require('util')

function resolveMapTransform (accumulator, transform, resolveTransform) {
  if (utils.reducerIsEmpty(transform)) {
    return Promise.resolve(accumulator)
  }
  return Promise.map(accumulator.value, itemValue => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveTransform(itemContext, transform).then(res => {
      return res.value
    })
  })
    .then(result => utils.set(accumulator, 'value', result))
    .catch(err => {
      err.message = `Entity: ${accumulator.reducer.spec.id}.map ${err.message}`
      throw err
    })
}

function resolveFilterTransform (accumulator, transform, resolveTransform) {
  if (utils.reducerIsEmpty(transform)) {
    return Promise.resolve(accumulator)
  }
  return Promise.filter(accumulator.value, itemValue => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveTransform(itemContext, transform).then(res => {
      return !!res.value
    })
  })
    .then(result => utils.set(accumulator, 'value', result))
    .catch(err => {
      err.message = `Entity: ${accumulator.reducer.spec.id}.filter ${
        err.message
      }`
      throw err
    })
}

function resolveFindTransform (accumulator, transform, resolveTransform) {
  if (utils.reducerIsEmpty(transform)) {
    return Promise.resolve(accumulator)
  }
  return Promise.reduce(
    accumulator.value,
    (result, itemValue) => {
      const itemContext = utils.set(accumulator, 'value', itemValue)
      return (
        result ||
        resolveTransform(itemContext, transform).then(res => {
          return res.value ? itemValue : undefined
        })
      )
    },
    null
  )
    .then(result => utils.set(accumulator, 'value', result))
    .catch(err => {
      err.message = `Entity: ${accumulator.reducer.spec.id}.find ${err.message}`
      throw err
    })
}

const modifierFunctionMap = {
  filter: resolveFilterTransform,
  map: resolveMapTransform,
  find: resolveFindTransform
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

// NOTE: as expensive as this might be, this is to avoid 'surprises'
function validateAsArray (acc) {
  const entity = acc.reducer.spec
  return acc.value instanceof Array
    ? acc
    : Promise.reject(
      new Error(
        Util.format(
          '%s received acc.value = %s of type %s,',
          entity.id,
          _.truncate(Util.inspect(acc.value, { breakLength: Infinity }), {
            length: 30
          }),
          utils.typeOf(acc.value),
          'this entity only resolves Array values. More info https://github.com/ViacomInc/data-point/tree/master/packages/data-point#collection-entity'
        )
      )
    )
}

function resolve (accumulator, resolveTransform) {
  const entity = accumulator.reducer.spec

  return resolveTransform(accumulator, entity.value)
    .then(acc => validateAsArray(acc))
    .then(acc => resolveCompose(acc, entity.compose, resolveTransform))
}

module.exports.resolve = resolve
