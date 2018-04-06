const storeManager = require('./store-manager')
const createReducer = require('../reducer-types').create

/**
 * @param {Object} entityTypes
 * @param {Object} source
 * @param {string} id
 * @return {Reducer}
 */
function createEntity (entityTypes, source, id) {
  const tokens = id.split(':')
  const entityType = tokens[0]
  const EntityType = entityTypes.get(entityType)
  const entity = EntityType.create(createReducer, source, id)
  return entity
}

module.exports.createEntity = createEntity

/**
 * @param {string} id
 * @return {Object} Error Object properties
 */
function errorInfoCbGet (id) {
  return {
    message: `Entity id '${id}' is not defined`,
    name: 'InvalidId'
  }
}

/**
 * @param {string} id
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
 * @param {Object} entityTypes
 * @return {Object}
 */
function create (entityTypes) {
  return storeManager.create({
    errorInfoCbGet,
    errorInfoCbAdd,
    create: createEntity.bind(null, entityTypes)
  })
}

module.exports.create = create
