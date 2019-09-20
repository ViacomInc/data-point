const createEntity = require("../entity-types/spec").create;
const storeManager = require("./store-manager");

/**
 * @param  {string} id
 * @return {Object} Error Object properties
 */
function errorInfoCbGet(id) {
  return {
    message: `Entity Module id '${id}' is not defined`,
    name: "InvalidId"
  };
}

/**
 * @param  {string} id
 * @return {Object} Error Object properties
 */
function errorInfoCbAdd(id) {
  return {
    message: `Entity Module with id '${id}' already exists`,
    name: "InvalidId"
  };
}

/**
 * create instance
 * @return {Object}
 */
function create() {
  return storeManager.create({
    errorInfoCbGet,
    errorInfoCbAdd,
    create: createEntity
  });
}

module.exports.create = create;
