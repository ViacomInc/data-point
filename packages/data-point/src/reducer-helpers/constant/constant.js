const cloneDeep = require("lodash/cloneDeep");

const { Reducer } = require("../../Reducer");

class ReducerConstant extends Reducer {
  constructor(spec) {
    super("constant", undefined, spec);
    // We clone the source to truly respect the nature of a constant, if the
    // original source is ever changed the data integrity of the constant
    // should be kept
    this.constantValue = cloneDeep(spec);
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
    return cloneDeep(this.constantValue);
  }
}

module.exports = {
  ReducerConstant
};
