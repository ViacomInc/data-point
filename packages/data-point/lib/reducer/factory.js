'use strict'

const _ = require('lodash')

const ReducerPath = require('../reducer-path')
const ReducerFunction = require('../reducer-function')
const ReducerObject = require('../reducer-object')
const ReducerEntity = require('../reducer-entity')
const util = require('util')

const reducerTypes = [ReducerPath, ReducerFunction, ReducerEntity]

/**
 * parse reducer
 * @param {Function} createTransform
 * @param {*} source
 * @throws if source is not a valid type for creating a reducer
 * @return {reducer}
 */
function create (createTransform, source) {
  // ReducerObject requires an extra parameter, so it's not included in the reducerTypes array
  if (ReducerObject.isType(source)) {
    return ReducerObject.create(createTransform, source)
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

module.exports.create = create
