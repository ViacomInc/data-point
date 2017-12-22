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
function isMap (source) {
  return isPlainObject(source)
}

module.exports.isMap = isMap

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
    const value = source[key]
    const fullPath = path.concat(key)
    if (isPlainObject(value)) {
      getReducerProps(createTransform, value, fullPath, reducerProps)
      continue
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
