'use strict'

const _ = require('lodash')

const REDUCER_PATH = (module.exports.type = 'ReducerPath')

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {string} name - name of the reducer
 * @property {Array} parameters - collection of  @see {@link Parameter} items
 */
function ReducerPath () {
  this.type = REDUCER_PATH
  this.name = ''
  this.castAs = []
  this.asCollection = false
}

module.exports.ReducerPath = ReducerPath

function isPath (source) {
  return _.isString(source) && source.charAt(0) === '$'
}

module.exports.isPath = isPath

/**
 * parse reducer
 * @param  {string} reducerRaw raw reducer path
 * @return {reducer}
 */
function create (source) {
  const reducer = new ReducerPath()

  const parts = source.split(':')

  reducer.asCollection = source.slice(-2) === '[]'
  reducer.name = _.defaultTo(parts[0].substr(1), '.').replace(/\[]$/, '')
  reducer.castAs = _.defaultTo(parts[1], '*')
  reducer.params = parts.slice(2)

  return Object.freeze(reducer)
}

module.exports.create = create
