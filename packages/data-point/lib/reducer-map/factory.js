const isPlainObject = require('lodash/isPlainObject')

const REDUCER_MAP = 'ReducerMap'

module.exports.type = REDUCER_MAP

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {Array} keyMap
 */
function ReducerMap () {
  this.type = REDUCER_MAP
  this.keyMap = undefined
}

module.exports.ReducerMap = ReducerMap

/**
 * @param {*} source
 * @returns {boolean}
 */
function isMap (source) {
  return isPlainObject(source)
}

module.exports.isMap = isMap

/**
 * @param {Function} createTransform
 * @param {Object} data
 * @param {Array} path
 * @param {Array} keyPaths
 * @returns {Array}
 */
function parseMapKeys (createTransform, data, path = [], keyPaths = []) {
  for (let key of Object.keys(data)) {
    const value = data[key]
    const isTransform = !key.startsWith('$')
    if (isTransform && isPlainObject(value)) {
      parseMapKeys(data[key], path.concat(key), keyPaths)
      continue
    }

    keyPaths.push({
      value: isTransform ? createTransform(value) : value,
      path: path.concat(key.replace(/^[$]/, '')),
      isTransform: isTransform
    })
  }

  return keyPaths
}

module.exports.parseMapKeys = parseMapKeys

/**
 * @param {Function} createTransform
 * @param {Object} source
 * @returns {reducer}
 */
function create (createTransform, source = {}) {
  const reducer = new ReducerMap()
  reducer.keyMap = parseMapKeys(createTransform, source)
  return Object.freeze(reducer)
}

module.exports.create = create
