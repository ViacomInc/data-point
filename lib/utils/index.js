'use strict'

/**
 * sets key to value of a copy of target. target stays untouched, if key is
 * an object, then the key will be taken as an object and merged with target
 * @param {Object} target
 * @param {string|Object} key
 * @param {*} value
 */
function set (target, key, value) {
  const obj = {}
  obj[key] = value
  return Object.assign({}, target, obj)
}
module.exports.set = set

function assign (target, toMerge) {
  return Object.assign({}, target, toMerge)
}
module.exports.assign = assign

let uid = 0
function getUID () {
  uid++
  return uid
}
module.exports.getUID = getUID

/**
 * source: https://stackoverflow.com/a/28475765
 * This method has not been tested for performance
 * and could be flawed its only purpose is for error messages
 * @param {*} value
 */
function typeOf (value) {
  return {}.toString
    .call(value)
    .split(' ')[1]
    .slice(0, -1)
    .toLowerCase()
}
module.exports.typeOf = typeOf
