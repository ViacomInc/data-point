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
function resolveObjectPath (acc, jsonPath) {
  if (jsonPath === '.' || _.isEmpty(jsonPath)) {
    return acc.value
  }

  if (jsonPath.substring(0, 2) === '..') {
    return _.get(acc, jsonPath.slice(2))
  }

  if (jsonPath.slice(-2) === '[]') {
    // take last entry in json path without []
    // $a.b.c[] => `$a.b` and `c`
    const pathArray = jsonPath.split('.')
    const valueKey = pathArray.pop().replace('[]', '')

    return (_.get(acc.value, pathArray)).map(i => i[valueKey])
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
  const value = resolveObjectPath(accumulator, reducerPath.name)
  return Promise.resolve(utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
