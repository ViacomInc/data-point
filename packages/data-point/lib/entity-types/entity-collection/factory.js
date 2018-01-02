'use strict'

const _ = require('lodash')
const createTransform = require('../../transform-expression').create
const parseCompose = require('../parse-compose')
const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntityCollection () {}

module.exports.EntityCollection = EntityCollection

const modifierKeys = ['filter', 'map', 'find']

function createCompose (composeParse) {
  return composeParse.map(modifier => {
    return _.assign({}, modifier, {
      transform: createTransform(modifier.spec)
    })
  })
}

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityCollection} Entity Object
 */
function create (spec, id) {
  parseCompose.validateComposeModifiers(spec, modifierKeys)

  const entity = createBaseEntity(EntityCollection, spec, id)

  const compose = parseCompose.parse(spec, modifierKeys)
  parseCompose.validateCompose(entity.id, compose, modifierKeys)
  entity.compose = createCompose(compose)

  return Object.freeze(entity)
}

module.exports.create = create
