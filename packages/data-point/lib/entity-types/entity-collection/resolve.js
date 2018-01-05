'use strict'

const Promise = require('bluebird')
const utils = require('../../utils')
const isEmpty = require('lodash/isEmpty')

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
function validateAsArray (acc) {
  const entity = acc.reducer.spec
  return acc.value instanceof Array
    ? acc
    : Promise.reject(
      new Error(`Entity ${entity.id}.value resolved to a non Array value`)
    )
}

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 */
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec

  // if there is nothing to do, lets just move on
  if (isEmpty(accumulator.value)) {
    return Promise.resolve(accumulator)
  }

  return resolveReducer(accumulator, entity.value)
    .then(acc => validateAsArray(acc))
    .then(acc => resolveCompose(acc, entity.compose, resolveReducer))
}

module.exports.resolve = resolve
