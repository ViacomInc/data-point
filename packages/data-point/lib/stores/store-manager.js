const _ = require("lodash");

/**
 * get all added models
 * @param {Object} manager
 * @return {Map}
 */
function getStore(manager) {
  return manager.store;
}

module.exports.getStore = getStore;

/**
 * clear map
 * @param {Object} manager
 * @return {Map}
 */
function clear(manager) {
  manager.store.clear();
  return manager.store;
}

module.exports.clear = clear;

/**
 * get value by id
 * @throws if value for id is undefined
 * @param {Object} manager
 * @param {Function} errorInfoCb
 * @param {string} id - model id
 * @return {*}
 */
function get(manager, errorInfoCb, id) {
  const value = manager.store.get(id);
  if (_.isUndefined(value)) {
    const errorInfo = errorInfoCb(id);
    const e = new Error(errorInfo.message);
    e.name = errorInfo.name;
    throw e;
  }

  return value;
}

module.exports.get = get;

/**
 * @throws if value already exists for id and override is not true
 * @param {Object} manager
 * @param {Function} errorInfoCb
 * @param {Function} factory
 * @param {string} id
 * @param {Object} spec
 * @param {boolean} override
 * @return {Map} returns reference to entire store
 */
function add(manager, errorInfoCb, factory, id, spec, override) {
  if (manager.store.get(id) && !override) {
    const errorInfo = errorInfoCb(id);
    const e = new Error(errorInfo.message);
    e.name = errorInfo.name;
    throw e;
  }

  const item = _.attempt(factory, spec, id);

  if (item instanceof Error) {
    item.entityId = id;
    item.message = `${item.message}\nEntity "${id}": ${JSON.stringify(
      spec,
      null,
      2
    )}`;
    throw item;
  }

  manager.store.set(id, item);

  return manager.store;
}

module.exports.add = add;

/**
 * @param {Object} spec
 * @returns {Object}
 */
function create(spec) {
  const manager = {
    store: new Map()
  };

  manager.getStore = getStore.bind(null, manager);
  manager.clear = clear.bind(null, manager);
  manager.get = get.bind(null, manager, spec.errorInfoCbGet);
  manager.add = add.bind(null, manager, spec.errorInfoCbAdd, spec.create);

  return manager;
}

module.exports.create = create;
