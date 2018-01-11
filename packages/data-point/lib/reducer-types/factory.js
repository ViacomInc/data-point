const _ = require('lodash')
const util = require('util')

const REDUCER_SYMBOL = require('./reducer-symbol')

const ReducerEntity = require('./reducer-entity')
const ReducerFunction = require('./reducer-function')
const ReducerHelpers = require('./reducer-helpers')
const ReducerList = require('./reducer-list')
const ReducerObject = require('./reducer-object')
const ReducerPath = require('./reducer-path')

const reducerTypes = [
  ReducerEntity,
  ReducerFunction,
  ReducerHelpers,
  ReducerList,
  ReducerObject,
  ReducerPath
]

/**
 * @param {*} item
 * @returns {boolean}
 */
function isReducer (item) {
  return !!(item && item[REDUCER_SYMBOL])
}

module.exports.isReducer = isReducer

/**
 * this is here because ReducerLists can be arrays or | separated strings
 * @param {*} source
 * @returns {Array<reducer>|reducer}
 */
function dealWithPipeOperators (source) {
  let result = ReducerList.parse(source)
  if (result.length === 1) {
    // do not create a ReducerList that only contains a single reducer
    result = result[0]
  }

  return result
}

/**
 * parse reducer
 * @param {*} source
 * @throws if source is not a valid type for creating a reducer
 * @return {reducer}
 */
function createReducer (source) {
  source = dealWithPipeOperators(source)
  const reducer = reducerTypes.find(r => r.isType(source))

  if (_.isUndefined(reducer)) {
    const message = [
      'Invalid reducer type.',
      ' Could not find a matching reducer type while parsing the value:\n ',
      _.attempt(util.inspect, source),
      '\nTry using an Array, String, Object, or Function.\n',
      'More info: https://github.com/ViacomInc/data-point/tree/master/packages/data-point#reducers\n'
    ].join('')

    throw new Error(message)
  }

  // NOTE: recursive call
  return reducer.create(createReducer, source)
}

module.exports.create = createReducer
