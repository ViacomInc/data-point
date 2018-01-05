'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const utils = require('../../utils')

/**
 * @param {Accumulator} accumulator
 * @param {reducer} composeReducer
 * @param {Function} resolveReducer
 */
function resolveCompose (accumulator, composeReducer, resolveReducer) {
  if (utils.reducerIsEmpty(composeReducer)) {
    return Promise.resolve(accumulator)
  }

  return resolveReducer(accumulator, composeReducer)
}

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

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 */
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec

  // if there is nothing to do, lets just move on
  if (typeof accumulator.value === 'undefined' || accumulator.value === null) {
    return Promise.resolve(accumulator)
  }

  return resolveReducer(accumulator, entity.value)
    .then(acc => validateAsObject(acc))
    .then(acc => resolveCompose(acc, entity.compose, resolveReducer))
}

module.exports.resolve = resolve
