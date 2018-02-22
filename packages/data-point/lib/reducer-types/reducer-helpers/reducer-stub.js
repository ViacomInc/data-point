const REDUCER_STUB_SYMBOL = Symbol('reducer stub')

module.exports.REDUCER_STUB_SYMBOL = REDUCER_STUB_SYMBOL

/**
 * @class
 * @param {string} type
 * @param {Array} args
 */
function ReducerStub (type, args) {
  this[REDUCER_STUB_SYMBOL] = true
  this.type = type
  this.args = args
}

module.exports.Constructor = ReducerStub

/**
 * @param {*} source
 * @returns {boolean}
 */
function isType (source) {
  return !!source && source[REDUCER_STUB_SYMBOL] === true
}

module.exports.isType = isType

/**
 * @param {string} type
 * @returns {ReducerStub}
 */
function create (type, ...args) {
  return new ReducerStub(type, args)
}

module.exports.create = create
