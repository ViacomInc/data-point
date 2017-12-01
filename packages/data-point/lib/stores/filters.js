'use strict'

const ObjectStoreManager = require('./object-store-manager')

/**
 * @param  {string} id
 * @return {Object} Error Object properties
 */
function errorInfoCbGet (path) {
  return {
    message: `Filter function or namespace '${path}' is not defined`,
    name: 'InvalidId'
  }
}

/**
 * @param  {string} id
 * @return {Object} Error Object properties
 */
function errorInfoCbAdd (id) {
  return {
    message: `Filter '${id}' already exists`,
    name: 'InvalidId'
  }
}

/**
 * create instance
 * @return {Object}
 */
function create () {
  return ObjectStoreManager.create({
    errorInfoCbGet,
    errorInfoCbAdd
  })
}

module.exports.create = create
