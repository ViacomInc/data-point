const _ = require('lodash')
const util = require('util')

const { IS_REDUCER, DEFAULT_VALUE } = require('./reducer-symbols')

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
  return !!(item && item[IS_REDUCER])
}

module.exports.isReducer = isReducer

/**
 * this is here because ReducerLists can be arrays or | separated strings
 * @param {*} source
 * @returns {Array<reducer>|reducer}
 */
function normalizeInput (source) {
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
 * @param {Object} options
 * @throws if source is not a valid type for creating a reducer
 * @return {reducer}
 */
function createReducer (source, options = {}) {
  source = normalizeInput(source)
  const reducerType = reducerTypes.find(r => r.isType(source))

  if (_.isUndefined(reducerType)) {
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
  const reducer = reducerType.create(createReducer, source)
  reducer[IS_REDUCER] = true
  if (_.has(options, 'default')) {
    reducer[DEFAULT_VALUE] = { value: options.default }
  }

  return Object.freeze(reducer)
}

module.exports.create = createReducer
