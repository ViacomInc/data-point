'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const utils = require('../../utils')

function resolveMapReducer (accumulator, reducer, resolveReducer) {
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }
  return Promise.map(accumulator.value, itemValue => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveReducer(itemContext, reducer).then(res => {
      return res.value
    })
  })
    .then(result => utils.set(accumulator, 'value', result))
    .catch(err => {
      err.message = `Entity: ${accumulator.reducer.spec.id}.map ${err.message}`
      throw err
    })
}

function resolveFilterReducer (accumulator, reducer, resolveReducer) {
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }
  return Promise.filter(accumulator.value, itemValue => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveReducer(itemContext, reducer).then(res => {
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

function resolveFindReducer (accumulator, reducer, resolveReducer) {
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }
  return Promise.reduce(
    accumulator.value,
    (result, itemValue) => {
      const itemContext = utils.set(accumulator, 'value', itemValue)
      return (
        result ||
        resolveReducer(itemContext, reducer).then(res => {
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
  filter: resolveFilterReducer,
  map: resolveMapReducer,
  find: resolveFindReducer
}

function resolveCompose (accumulator, composeReducers, resolveReducer) {
  if (composeReducers.length === 0) {
    return Promise.resolve(accumulator)
  }

  return Promise.reduce(
    composeReducers,
    (resultContext, modifierSpec) => {
      const modifierFunction = modifierFunctionMap[modifierSpec.type]
      return modifierFunction(
        resultContext,
        modifierSpec.reducer,
        resolveReducer
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
      new Error(`Entity ${entity.id}.value resolved to a non Array value`)
    )
}

function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec

  // if there is nothing to do, lets just move on
  if (_.isEmpty(accumulator.value)) {
    return Promise.resolve(accumulator)
  }

  return resolveReducer(accumulator, entity.value)
    .then(acc => validateAsArray(acc))
    .then(acc => resolveCompose(acc, entity.compose, resolveReducer))
}

module.exports.resolve = resolve
