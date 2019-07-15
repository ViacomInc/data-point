const _ = require('lodash')

const REDUCER_OBJECT = 'ReducerObject'

module.exports.type = REDUCER_OBJECT

/**
 * @class
 * @property {string} type - @see reducerType
 * @property {Function} source
 * @property {Array<Object>} reducers
 * @property {boolean} isEmpty
 */
function ReducerObject () {
  this.type = REDUCER_OBJECT
  this.source = undefined
  this.reducers = undefined
}

module.exports.Constructor = ReducerObject

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType (source) {
  return _.isPlainObject(source)
}

module.exports.isType = isType

/**
 * @return {Object}
 */
function newProps () {
  return {
    constants: {},
    reducers: []
  }
}

module.exports.newProps = newProps

/**
 * @param {Function} createReducer
 * @param {Object} source
 * @param {Array} stack
 * @param {Object} props
 * @returns {Array}
 */
function getProps (createReducer, source, stack = [], props = newProps()) {
  for (const key of Object.keys(source)) {
    const path = stack.concat(key)
    const value = source[key]
    if (_.isPlainObject(value)) {
      // NOTE: recursive call
      getProps(createReducer, value, path, props)
      continue
    }

    const reducer = createReducer(value)
    if (reducer.type === 'ReducerConstant') {
      _.set(props.constants, path, reducer.value)
    } else {
      props.reducers.push({ path, reducer })
    }
  }

  return props
}

module.exports.getProps = getProps

/**
 * @param {Object} source
 * @return {Function}
 */
function getSourceFunction (source) {
  const fn = () => _.cloneDeep(source)
  Object.defineProperty(fn, 'name', { value: 'source' })
  return fn
}

module.exports.getSourceFunction = getSourceFunction

/**
 * @param {Function} createReducer
 * @param {Object} source
 * @returns {reducer}
 */
function create (createReducer, source = {}) {
  const props = getProps(createReducer, source)

  const reducer = new ReducerObject()
  reducer.source = getSourceFunction(props.constants)
  reducer.reducers = props.reducers

  return reducer
}

module.exports.create = create
