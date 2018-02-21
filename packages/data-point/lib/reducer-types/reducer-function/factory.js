const _ = require('lodash')
const Promise = require('bluebird')

const REDUCER_FUNCTION = 'ReducerFunction'

module.exports.type = REDUCER_FUNCTION

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {Function} body - actual function
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

  // do not include the name for arrow functions (which do not have a prototype),
  // because some arrow functions have inferred names, which might be confusing
  // if they show up in the reducer stack traces for error messages
  const name = (reducer.body.prototype && reducer.body.name) || ''
  name && (reducer.name = name)
  return reducer
}

module.exports.create = create
