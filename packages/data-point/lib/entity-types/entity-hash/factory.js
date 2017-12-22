'use strict'

const _ = require('lodash')
const createTransform = require('../../transform-expression').create
const deepFreeze = require('deep-freeze')
const parseCompose = require('../parse-compose')
const helpers = require('../../helpers')

/**
 * @class
 */
function EntityHash () {}

module.exports.EntityHash = EntityHash

const modifierKeys = ['omitKeys', 'pickKeys', 'mapKeys', 'addValues', 'addKeys']

function parseCollectionKeys (object, parseCallback) {
  const result = {}

  _.forOwn(object, (value, key) => {
    result[key] = parseCallback(object[key])
  })

  return result
}

module.exports.parseCollectionKeys = parseCollectionKeys

function createCompose (composeParse) {
  return composeParse.map(modifier => {
    let transform
    let spec
    switch (modifier.type) {
      case 'addValues':
        spec = _.defaultTo(modifier.spec, {})
        transform = deepFreeze(spec)
        break
      case 'omitKeys':
      case 'pickKeys':
        spec = _.defaultTo(modifier.spec, [])
        transform = Object.freeze(spec.slice(0))
        break
      case 'mapKeys':
      case 'addKeys':
        spec = _.defaultTo(modifier.spec, {})
        transform = parseCollectionKeys(spec, createTransform)
    }
    return _.assign({}, modifier, {
      transform
    })
  })
}

function validateComposeVsInlineModifiers (spec, invalidInlinesKeys) {
  if (!spec.compose) {
    return true
  }

  if (spec.compose && !(spec.compose instanceof Array)) {
    throw new Error(
      `Entity ${
        spec.id
      } Hash.compose property is expected to be of instance of Array and found ${
        spec.compose
      }`
    )
  }

  const specKeys = Object.keys(spec)
  const intersection = _.intersection(invalidInlinesKeys, specKeys)
  if (intersection.length !== 0) {
    throw new Error(
      `Entity ${
        spec.id
      } is invalid, when 'compose' is defined the key(s): '${intersection.join(
        ', '
      )}' should be inside compose.`
    )
  }
}

function validateCompose (entityId, compose, validKeys) {
  compose.forEach(modifier => {
    if (validKeys.indexOf(modifier.type) === -1) {
      throw new Error(
        `Modifier '${modifier.type}' in ${
          entityId
        } doest not match any of the registered Modifiers: ${validKeys}`
      )
    }
  })
}

/**
 * Creates new Entity Object
 * @param  {Object} spec - spec
 * @param {string} id - Entity id
 * @return {EntityHash} Entity Object
 */
function create (spec, id) {
  validateComposeVsInlineModifiers(spec, modifierKeys)

  const entity = helpers.createEntity(EntityHash, spec, id)

  const compose = parseCompose.parse(spec, modifierKeys)
  validateCompose(entity.id, compose, modifierKeys)
  entity.compose = createCompose(compose)

  return Object.freeze(entity)
}

module.exports.create = create
