const set = require("lodash/set");
const cloneDeep = require("lodash/cloneDeep");

const { Reducer } = require("./Reducer");
const isReducerConstant = require("./is-reducer-constant");

function isPlainObject(obj) {
  return (
    typeof obj === "object" && Object.getPrototypeOf(obj) === Object.prototype
  );
}

function newProps() {
  return {
    constant: {},
    reducers: []
  };
}

/**
 * NOTE: This function makes recursive calls to itself
 * @param {Function} createReducer
 * @param {Object} source
 * @param {Array} stack
 * @param {Object} props
 * @returns {Object} a props object
 */
function getProps(createReducer, source, stack = [], props = newProps()) {
  Object.keys(source).forEach(key => {
    const path = stack.concat(key);
    const value = source[key];

    if (isReducerConstant(value)) {
      set(props.constant, path, value.constantValue);
      return;
    }

    if (isPlainObject(value)) {
      // NOTE: recursive call
      getProps(createReducer, value, path, props);
      return;
    }

    const reducer = createReducer(value);
    props.reducers.push({ path, reducer });
  });

  return props;
}

class ReducerObject extends Reducer {
  constructor(spec, createReducer) {
    super("object", undefined, spec);

    this.reducerProperties = getProps(createReducer, spec);
  }

  static isType(spec) {
    return isPlainObject(spec);
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Function} resolveReducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const reducers = this.reducerProperties.reducers;

    // clone constant value so any subsequent change to the object
    // is not treated as a reference to the original source
    const result = cloneDeep(this.reducerProperties.constant);

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
  getProps,
  ReducerObject
};
