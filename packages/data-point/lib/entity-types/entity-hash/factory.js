'use strict'

const createReducer = require('../../reducer-types').create
const deepFreeze = require('deep-freeze')
const constant = require('lodash/constant')
const defaultTo = require('lodash/defaultTo')
const reducerHelpers = require('../../reducer-types/reducer-helpers')
const parseCompose = require('../parse-compose')
const createBaseEntity = require('../base-entity').create

/**
 * @class
 */
function EntityHash () {}

module.exports.EntityHash = EntityHash

const modifierKeys = ['omitKeys', 'pickKeys', 'mapKeys', 'addValues', 'addKeys']

const modifiers = {
  omit: reducerHelpers.stubFactories.omit,
  pick: reducerHelpers.stubFactories.pick,
  map: reducerHelpers.stubFactories.map,
  assign: reducerHelpers.stubFactories.assign
}

function createCompose (composeParse) {
  const specList = composeParse.map(modifier => {
    let spec
    switch (modifier.type) {
      case 'omitKeys':
        spec = modifiers.omit(modifier.spec)
        break
      case 'pickKeys':
        spec = modifiers.pick(modifier.spec)
        break
      case 'mapKeys':
        spec = modifier.spec
        break
      case 'addValues':
        const values = deepFreeze(defaultTo(modifier.spec, {}))
        spec = modifiers.assign(constant(values))
        break
      case 'addKeys':
        spec = modifiers.assign(modifier.spec)
        break
    }

    return spec
  })

  return createReducer(specList)
}

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityHash} Entity Object
 */
function create (spec, id) {
  parseCompose.validateComposeModifiers(spec, modifierKeys)

  const entity = createBaseEntity(EntityHash, spec, id)

  const compose = parseCompose.parse(spec, modifierKeys)
  parseCompose.validateCompose(entity.id, compose, modifierKeys)
  entity.compose = createCompose(compose)

  return Object.freeze(entity)
}

module.exports.create = create
