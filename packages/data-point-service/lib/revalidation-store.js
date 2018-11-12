const debug = require('debug')('data-point-service:cache')
const throttle = require('lodash/throttle')

/**
 * Maximum number of entries to store
 * NOTE: This value is only meant to add a cap to the keys we store. If there
 * is any strong feeling on making this part smarter such as creating a FIFO
 * sort of logic PRs are welcomed
 */
const MAX_STORE_SIZE = 10000

/**
 * Time to wait for cleanup to trigger in case it's called more than once within
 * the range placed.
 */
const THROTTLE_WAIT = 1000 // milliseconds

/**
 * It marks and deletes all the keys that have their ttl expired
 * @param {Map} store Map Object that stores all the cached keys
 */
function clear (store) {
  const forDeletion = []
  const now = Date.now()

  for (const [key, entry] of store) {
    // mark for deletion entries that have timed out
    if (now - entry.created > entry.ttl) {
      forDeletion.push(key)
    }
  }

  // if nothing to clean then exit
  if (forDeletion.length === 0) {
    return
  }

  debug(`local revalidation flags that timed out: ${forDeletion}`)
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
  store.set(key, { created: Date.now(), ttl })
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
  return !!entry && Date.now() - entry.created < entry.ttl
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
