'use strict'

const _ = require('lodash')

const ReducerPath = require('../reducer-path')
const ReducerFunction = require('../reducer-function')
const ReducerMap = require('../reducer-map')
const ReducerEntity = require('../reducer-entity')
const util = require('util')

const reducerTypes = [ReducerPath, ReducerFunction, ReducerEntity]

/**
 * parse reducer
 * @param  {string} source - reducer string representation
 * @return {reducer}
 */
function create (createTransform, source) {
  // ReducerMap requires an extra parameter, so
  // it's not included in the reducerTypes array
  if (ReducerMap.isType(source)) {
    return ReducerMap.create(createTransform, source)
  }

  const reducer = _.find(reducerTypes, r => r.isType(source))

  if (_.isUndefined(reducer)) {
    const message = [
      'Invalid reducer type.',
      ' Could not find a matching reducer type while parsing the value:\n ',
      _.attempt(util.inspect, source),
      '\nFor a list of supported types visit:\n',
      'https://github.com/ViacomInc/data-point/tree/master/packages/data-point#reducers\n'
    ].join('')

    throw new Error(message)
  }

  return reducer.create(source)
}

module.exports.create = create
