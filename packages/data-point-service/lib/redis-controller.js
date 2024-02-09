/**
 * @param {String} key cache key
 * @returns {String} key postfixed with "swr.stale"
 */
function createSWRStaleKey(key) {
  return `${key}:swr.stale`;
}

/**
 * @param {String} key cache key
 * @returns {String} key postfixed with "swr.control"
 */
function createSWRControlKey(key) {
  return `${key}:swr.control`;
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise<Object|undefined>} entry value
 */
function getEntry(service, key) {
  return service.cache.get(key);
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise}
 */
function deleteEntry(service, key) {
  return service.cache.del(key);
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise<Object|undefined>} entry value
 */
function getSWRStaleEntry(service, key) {
  return service.cache.get(createSWRStaleKey(key));
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise<Object|undefined>} entry value
 */
function getSWRControlEntry(service, key) {
  return getEntry(service, createSWRControlKey(key));
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {Object} value entry value
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setEntry(service, key, value, ttl) {
  return service.cache.set(key, value, ttl);
}

/**
 * When stale is provided the value is calculated as ttl + stale
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {Object} value entry value
 * @param {Number|String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setSWRStaleEntry(service, key, value, ttl) {
  return setEntry(service, createSWRStaleKey(key), value, ttl);
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setSWRControlEntry(service, key, ttl, value) {
  return setEntry(service, createSWRControlKey(key), value, ttl);
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function deleteSWRControlEntry(service, key) {
  return deleteEntry(service, createSWRControlKey(key));
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise}
 */
function deleteSWRStaleEntry(service, key) {
  const staleKey = createSWRStaleKey(key);
  return deleteEntry(service, staleKey);
}

module.exports = {
  createSWRControlKey,
  createSWRStaleKey,
  deleteEntry,
  deleteSWRControlEntry,
  deleteSWRStaleEntry,
  getEntry,
  getSWRControlEntry,
  getSWRStaleEntry,
  setEntry,
  setSWRControlEntry,
  setSWRStaleEntry
};
