const cloneDeep = require("lodash/cloneDeep");

const { Reducer } = require("../../Reducer");
const isPlainObject = require("../../is-plain-object");

/**
 * @private
 * @param {Boolean} isObject true if parameter `value` is assumed to be an object
 * @param {any} value
 */
function cloneObject(isObject, value) {
  return isObject ? cloneDeep(value) : value;
}

class ReducerConstant extends Reducer {
  constructor(spec) {
    super(undefined, spec);
    this.isPlainObject = isPlainObject(spec);
    // We clone the source to truly respect the nature of a constant, if the
    // original source is ever changed the data integrity of the constant
    // should be kept
    this.constantValue = cloneObject(this.isPlainObject, spec);
  }

  static create(spec) {
    return new ReducerConstant(spec);
  }

  /**
   * @returns {any} deep cloned version of the original source
   */
  resolve() {
    // this clone happens so any future changes to the output do not
    // affect the original value of this.constantValue
    return cloneObject(this.isPlainObject, this.constantValue);
  }
}

module.exports = {
  cloneObject,
  ReducerConstant
};
