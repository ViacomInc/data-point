'use strict'

const _ = require('lodash')
const utils = require('../utils')

/**
 * resolve the JSON Object path from given value
 *
 * @param {Object} value
 * @param {string} jsonPath
 * @returns
 */
function resolveObjectPath (acc, jsonPath, reducerPath = {}) {
  const { type, asCollection } = reducerPath

  if (jsonPath === '.' || _.isEmpty(jsonPath)) {
    return acc.value
  }

  if (jsonPath.substring(0, 2) === '..') {
    return _.get(acc, jsonPath.slice(2))
  }

  if (type === 'ReducerPath' && asCollection) {
    if (!Array.isArray(acc.value)) {
      return null
    }

    return _.map(acc.value, jsonPath)
  }

  return _.get(acc.value, jsonPath)
}

module.exports.resolveObjectPath = resolveObjectPath

/**
 * resolve a reducer json path from a accumulator object
 *
 * @param {Object} store
 * @param {function} resolveReducer
 * @param {Accumulator} accumulator current accumulator
 * @param {ReducerPath} reducerPath
 * @returns {Promise<Accumulator>}
 */
function resolve (store, resolveReducer, accumulator, reducerPath) {
  const value = resolveObjectPath(accumulator, reducerPath.name, reducerPath)
  return Promise.resolve(utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
