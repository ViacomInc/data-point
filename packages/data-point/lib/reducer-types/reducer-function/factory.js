const _ = require('lodash')
const Promise = require('bluebird')

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
  this.type = REDUCER_FUNCTION
  this.body = undefined
}

module.exports.Constructor = ReducerFunction

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
  if (fn.length > 3) {
    const e = new Error(`Reducer functions must have an arity of 3 at most`)
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
  // if the arity is 3, we expect a Node Style
  // callback function with the form of (value, acc, done)
  if (source.length === 3) {
    reducer.body = Promise.promisify(source)
  } else {
    reducer.body = source
  }

  return reducer
}

module.exports.create = create
