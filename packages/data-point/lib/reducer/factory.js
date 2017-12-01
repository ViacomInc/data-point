'use strict'

const _ = require('lodash')

const ReducerPath = require('../reducer-path')
const ReducerFunction = require('../reducer-function')
const ReducerEntity = require('../reducer-entity')

const reducerTypes = [ReducerPath, ReducerFunction, ReducerEntity]

/**
 * parse reducer
 * @param  {string} source - reducer string representation
 * @return {reducer}
 */
function create (source) {
  const reducer = _.find(reducerTypes, r => r.isType(source))

  if (_.isUndefined(reducer)) {
    return new Error(`Invalid reducer type: ${source}`)
  }

  return reducer.create(source)
}

module.exports.create = create
