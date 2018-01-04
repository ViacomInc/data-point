'use strict'

const _ = require('lodash')

const ReducerPath = require('../reducer-path')
const ReducerFunction = require('../reducer-function')
const ReducerObject = require('../reducer-object')
const ReducerEntity = require('../reducer-entity')
const ReducerList = require('../reducer-list')
const util = require('util')

const reducerTypes = [ReducerPath, ReducerFunction, ReducerEntity]

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

  if (ReducerObject.isType(source)) {
    return ReducerObject.create(createReducer, source)
  }

  if (ReducerList.isType(source)) {
    return ReducerList.create(createReducer, source)
  }

  const reducer = _.find(reducerTypes, r => r.isType(source))

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

  return reducer.create(source)
}

module.exports.create = createReducer
