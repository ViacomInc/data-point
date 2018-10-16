const debug = require('debug')('data-point-service:cache')
const throttle = require('lodash/throttle')

const MAX_STORE_SIZE = 10000
const THROTTLE_WAIT = 1000 // cleanup in every 1 seconds

/**
 * It marks and deletes all the keys that have their ttl expired
 * @param {Map} store Map Object that stores all the cached keys
 */
function clear (store) {
  const forDeletion = []
  const now = Date.now()

  for (const entry of store) {
    // mark for deletion entries that have timed out
    if (now - entry[1][0] > entry[1][1]) {
      forDeletion.push(entry[0])
    }
  }

  if (forDeletion.length > 0) {
    debug(`local revalidation flags that timed out: ${forDeletion}`)
  }

  forDeletion.forEach(key => store.delete(key))
}

/**
 * @param {Map} store Map Object that stores all the cached keys
 * @param {Number} maxStoreSize Size to limit the store, if above this number keys will no longer be saved
 * @param {String} key key value
 * @param {Number} ttl time the key will be alive, expressed in milliseconds
 */
function add (store, maxStoreSize, key, ttl) {
  // do not add more than 10000 keys
  if (store.size > maxStoreSize) return false
  store.set(key, [Date.now(), ttl])
  return true
}

/**
 * @param {Map} store Map Object that stores all the cached keys
 * @param {String} key key value
 */
function remove (store, key) {
  store.delete(key)
  return true
}

/**
 * True if a key exists, and it has not expired
 * @param {Map} store Map Object that stores all the cached keys
 * @param {String} key key value
 */
function exists (store, key) {
  const entry = store.get(key)
  // checks entry exists and it has not timed-out
  return !!entry && Date.now() - entry[0] < entry[1]
}

/**
 * Creates an in-memory Revalidation Controller
 */
function create () {
  const store = new Map()

  return {
    store,
    add: add.bind(null, store, MAX_STORE_SIZE),
    remove: remove.bind(null, store),
    exists: exists.bind(null, store),
    clear: throttle(clear.bind(null, store), THROTTLE_WAIT)
  }
}

module.exports = {
  MAX_STORE_SIZE,
  THROTTLE_WAIT,
  clear,
  add,
  remove,
  exists,
  create
}
