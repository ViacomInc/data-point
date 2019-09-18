const set = require("lodash/set");
const cloneDeep = require("lodash/cloneDeep");

const { Reducer } = require("./Reducer");
const { ReducerConstant } = require("./reducer-helpers/constant/constant");
const isPlainObject = require("./is-plain-object");

function newProps() {
  return {
    constant: {},
    reducers: []
  };
}

/**
 * This function makes recursive calls to itself
 * @private
 * @param {Function} createReducer
 * @param {Object} source
 * @param {Array} stack
 * @param {Object} props
 * @returns {Object} a props object
 */
function getObjectProperties(
  createReducer,
  source,
  stack = [],
  props = newProps()
) {
  Object.keys(source).forEach(key => {
    const path = stack.concat(key);
    const value = source[key];

    if (value instanceof ReducerConstant) {
      set(props.constant, path, value.constantValue);
      return;
    }

    if (isPlainObject(value)) {
      // NOTE: recursive call
      getObjectProperties(createReducer, value, path, props);
      return;
    }

    const reducer = createReducer(value);
    props.reducers.push({ path, reducer });
  });

  return props;
}

/**
 * @class
 * @classdesc **IMPORTANT:** This class is meant to be only called internally by DataPoint.
 * @protected
 * @extends {Reducer}
 */
class ReducerObject extends Reducer {
  constructor(spec, createReducer) {
    super(undefined, spec);

    this.objectProperties = getObjectProperties(createReducer, spec);
  }

  /**
   * @static
   * @param {*} spec
   */
  static isType(spec) {
    return isPlainObject(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {resolve} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const reducers = this.objectProperties.reducers;

    // clone constant value so any subsequent change to the object
    // is not treated as a reference to the original source
    const result = cloneDeep(this.objectProperties.constant);

    if (reducers.length === 0) {
      return result;
    }

    await Promise.all(
      reducers.map(async ({ reducer, path }) => {
        const value = await resolveReducer(accumulator, reducer);
        set(result, path, value);
      })
    );

    return result;
  }
}

module.exports = {
  isPlainObject,
  getObjectProperties,
  ReducerObject
};
