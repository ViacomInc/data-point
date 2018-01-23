const set = require('lodash/set')
const isEmpty = require('lodash/isEmpty')
const isPlainObject = require('lodash/isPlainObject')

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
  this.isEmpty = undefined
  this.source = undefined
  this.reducers = undefined
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
  for (let key of Object.keys(source)) {
    const path = stack.concat(key)
    const value = source[key]
    if (isPlainObject(value)) {
      // NOTE: recursive call
      getProps(createReducer, value, path, props)
      continue
    }

    const reducer = createReducer(value)
    if (reducer.type === 'ReducerConstant') {
      set(props.constants, path, reducer.value)
    } else {
      props.reducers.push({ path, reducer })
    }
  }

  return props
}

module.exports.getProps = getProps

/**
 * @param {Function} createReducer
 * @param {Object} source
 * @returns {reducer}
 */
function create (createReducer, source = {}) {
  const props = getProps(createReducer, source)

  const reducer = new ReducerObject()
  reducer.isEmpty = isEmpty(props.constants) && isEmpty(props.reducers)
  reducer.source = Function(`return ${JSON.stringify(props.constants)}`) // eslint-disable-line no-new-func
  Object.defineProperty(reducer.source, 'name', { value: 'source' })
  reducer.reducers = props.reducers

  return reducer
}

module.exports.create = create
