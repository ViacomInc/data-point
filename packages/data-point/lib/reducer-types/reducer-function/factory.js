'use strict'

const _ = require('lodash')

const REDUCER_SYMBOL = require('../reducer-symbol')

const REDUCER_FUNCTION = 'ReducerFunction'

module.exports.type = REDUCER_FUNCTION

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {Array} parameters - collection of  @see {@link Parameter} items
 * @property {boolean} isFunction - true if reducer is already function
 * @property {Function} body - actual function body
 */
function ReducerFunction () {
  this[REDUCER_SYMBOL] = true
  this.type = REDUCER_FUNCTION
  this.body = undefined
}

module.exports.ReducerFunction = ReducerFunction

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType (source) {
  return _.isFunction(source)
}

module.exports.isType = isType

/**
 * @param {Function} fn
 * @throws if fn has an arity greater than 2
 * @returns {boolean}
 */
function validateFunction (fn) {
  if (fn.length > 2) {
    const e = new Error(`Reducer functions must have an arity of 2 at most`)
    e.name = 'InvalidArity'
    throw e
  }

  return true
}

module.exports.validateFunction = validateFunction

/**
 * @param {Function} createReducer
 * @param {Function} source
 * @return {reducer}
 */
function create (createReducer, source) {
  validateFunction(source)
  const reducer = new ReducerFunction()
  reducer.body = source
  return Object.freeze(reducer)
}

module.exports.create = create
