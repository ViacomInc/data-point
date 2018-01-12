const _ = require('lodash')
const storeManager = require('./store-manager')

/**
 * parse reducer
 * @param  {string} reducerRaw raw reducer path
 * @return {reducer}
 */
function createEntity (entityTypes, source, id) {
  const tokens = id.split(':')
  const entityType = tokens[0]
  const EntityType = entityTypes.get(entityType)
  const entity = EntityType.create(source, id)
  return entity
}

module.exports.createEntity = createEntity

/**
 * @param  {string} id
 * @return {Object} Error Object properties
 */
function errorInfoCbGet (id) {
  return {
    message: `Entity id '${id}' is not defined`,
    name: 'InvalidId'
  }
}

/**
 * @param  {string} id
 * @return {Object} Error Object properties
 */
function errorInfoCbAdd (id) {
  return {
    message: `Entity with id '${id}' already exists`,
    name: 'InvalidId'
  }
}

/**
 * create instance
 * @return {Object}
 */
function create (entityTypes) {
  return storeManager.create({
    errorInfoCbGet,
    errorInfoCbAdd,
    create: _.partial(createEntity, entityTypes)
  })
}

module.exports.create = create
