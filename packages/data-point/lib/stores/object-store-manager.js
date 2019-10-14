const _ = require("lodash");

/**
 * get the store
 * @param {Object} manager
 * @return {Object}
 */
function getStore(manager) {
  return manager.store;
}

module.exports.getStore = getStore;

/**
 * clears the store
 * @param {Object}
 * @return {Object}
 */
function clear(manager) {
  /* eslint no-param-reassign: "off" */
  manager.store = {};
  return manager;
}
module.exports.clear = clear;

/**
 * get value by path
 * @throws if the value for path is undefined
 * @param {Object} manager
 * @param {Function} errorInfoCb
 * @param {string} path - dot notation to access an object value
 * @return {*}
 */
function get(manager, errorInfoCb, path) {
  const value = _.get(manager.store, path);
  if (_.isUndefined(value)) {
    const errorInfo = errorInfoCb(path);
    const e = new Error(errorInfo.message);
    e.name = errorInfo.message.name;
    throw e;
  }

  return value;
}

module.exports.get = get;

/**
 * @throws if a value already exists for path and override is not true
 * @param {Object} manager
 * @param {Function} errorInfoCb
 * @param {string} path - dot notation to set an object value
 * @param {*} value
 * @param {boolean} override
 * @return {*} returns reference to entire manager.store
 */
function add(manager, errorInfoCb, path, value, override) {
  const filter = _.get(manager.store, path);
  if (!override && filter) {
    const errorInfo = errorInfoCb(path);
    const e = new Error(errorInfo.message);
    e.name = errorInfo.message.name;
    throw e;
  }

  _.set(manager.store, path, value);

  return manager.store;
}

module.exports.add = add;

/**
 * create instance
 * @param {Object} spec
 * @return {Object}
 */
function create(spec) {
  const manager = {
    store: {}
  };

  manager.getStore = getStore.bind(null, manager);
  manager.clear = clear.bind(null, manager);
  manager.get = get.bind(null, manager, spec.errorInfoCbGet);
  manager.add = add.bind(null, manager, spec.errorInfoCbAdd);

  return manager;
}

module.exports.create = create;
