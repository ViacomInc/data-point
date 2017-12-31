const isPlainObject = require('lodash/isPlainObject')

const REDUCER_OBJECT = 'ReducerObject'

module.exports.type = REDUCER_OBJECT

const IDENTITY_PLACEHOLDER = true

module.exports.IDENTITY_PLACEHOLDER = IDENTITY_PLACEHOLDER

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
function isObject (source) {
  return isPlainObject(source)
}

module.exports.isObject = isObject

/**
 * @param {Function} createTransform
 * @param {Object} source
 * @param {Array} path
 * @param {Array} reducerProps
 * @returns {Array}
 */
function getReducerProps (
  createTransform,
  source,
  path = [],
  reducerProps = []
) {
  for (let key of Object.keys(source)) {
    let value = source[key]
    const fullPath = path.concat(key)
    if (isPlainObject(value)) {
      // NOTE: recursive call
      getReducerProps(createTransform, value, fullPath, reducerProps)
      continue
    }

    if (value === IDENTITY_PLACEHOLDER) {
      value = `$${fullPath.join('.')}`
    }

    reducerProps.push({
      path: fullPath,
      transform: createTransform(value)
    })
  }

  return reducerProps
}

module.exports.getReducerProps = getReducerProps

/**
 * @param {Function} createTransform
 * @param {Object} source
 * @returns {reducer}
 */
function create (createTransform, source = {}) {
  const reducer = new ReducerObject()
  reducer.props = getReducerProps(createTransform, source)

  return Object.freeze(reducer)
}

module.exports.create = create
