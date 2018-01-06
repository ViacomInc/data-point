const isPlainObject = require('lodash/isPlainObject')

const REDUCER_OBJECT = 'ReducerObject'

module.exports.type = REDUCER_OBJECT

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {Array} props
 */
function ReducerObject () {
  this.type = REDUCER_OBJECT
  this.props = undefined
}

module.exports.ReducerObject = ReducerObject

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType (source) {
  return isPlainObject(source)
}

module.exports.isType = isType

/**
 * @param {Function} createReducer
 * @param {Object} source
 * @param {Array} path
 * @param {Array} props
 * @returns {Array}
 */
function getReducerProps (createReducer, source, path = [], props = []) {
  for (let key of Object.keys(source)) {
    const value = source[key]
    const fullPath = path.concat(key)
    if (isPlainObject(value)) {
      // NOTE: recursive call
      getReducerProps(createReducer, value, fullPath, props)
      continue
    }

    props.push({
      path: fullPath,
      reducer: createReducer(value)
    })
  }

  return props
}

module.exports.getReducerProps = getReducerProps

/**
 * @param {Function} createReducer
 * @param {Object} source
 * @returns {reducer}
 */
function create (createReducer, source = {}) {
  const reducer = new ReducerObject()
  reducer.props = getReducerProps(createReducer, source)

  return Object.freeze(reducer)
}

module.exports.create = create
