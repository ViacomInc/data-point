'use strict'

const _ = require('lodash')
const fp = require('lodash/fp')
const createTransform = require('../../transform-expression').create
const helpers = require('../../helpers')
const TransformKeys = require('./transform-keys')

/**
 * @class
 */
function Source () {
  this.url = undefined
  this.options = {}
  this.beforeRequest = undefined
}

module.exports.Source = Source

function getTransformKeys (options) {
  const transformKeys = TransformKeys.getTransformKeys(options)
  return transformKeys.map(key => {
    return Object.assign({}, key, {
      transform: createTransform(key.value)
    })
  })
}

function unsetTransformKeys (options, transformOptionKeys) {
  return transformOptionKeys.reduce((acc, transformKey) => {
    return fp.unset(transformKey.originalPath, acc)
  }, options)
}

module.exports.unsetTransformKeys = unsetTransformKeys

/**
 * creates new Source based on spec
 * @param  {Object} spec - source spec
 * @return {Source}
 */
function create (spec) {
  const entity = helpers.createEntity(Source, spec)
  const options = _.defaultTo(spec.options, {})
  entity.url = _.defaultTo(spec.url, '')
  entity.beforeRequest = createTransform(spec.beforeRequest)
  entity.transformOptionKeys = getTransformKeys(options)
  entity.options = unsetTransformKeys(options, entity.transformOptionKeys)

  return Object.freeze(entity)
}

module.exports.create = create
