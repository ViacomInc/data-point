const isPlainObject = require("lodash/isPlainObject");
const set = require("lodash/set");
const cloneDeep = require("lodash/cloneDeep");

const { ReducerNative } = require("./ReducerNative");

/**
 * @return {Object}
 */
function newProps() {
  return {
    constants: {},
    reducers: []
  };
}

/**
 * @param {Function} createReducer
 * @param {Object} source
 * @param {Array} stack
 * @param {Object} props
 * @returns {Array}
 */
function getProps(createReducer, source, stack = [], props = newProps()) {
  Object.keys(source).forEach(key => {
    const path = stack.concat(key);
    const value = source[key];
    if (isPlainObject(value)) {
      // NOTE: recursive call
      getProps(createReducer, value, path, props);
      return;
    }

    const reducer = createReducer(value);
    // TODO: should we implement ReducerConstant?
    if (reducer.type === "ReducerConstant") {
      set(props.constants, path, reducer.value);
    } else {
      props.reducers.push({ path, reducer });
    }
  });

  return props;
}

/**
 * @param {Object} source
 * @return {Function}
 */
function getSourceFunction(source) {
  const fn = () => cloneDeep(source);
  Object.defineProperty(fn, "name", { value: "source" });
  return fn;
}

class ReducerObject extends ReducerNative {
  constructor(spec, createReducer) {
    super("object", undefined, spec);

    const props = getProps(createReducer, spec);

    this.source = getSourceFunction(props.constants);
    this.reducers = props.reducers;
  }

  static isType(spec) {
    return isPlainObject(spec);
  }

  /**
   * @param {Object} manager
   * @param {Function} resolveReducer
   * @param {Accumulator} accumulator
   * @param {ReducerObject} reducer
   * @returns {Promise}
   */
  async resolve(accumulator, resolveReducer) {
    const reducers = this.reducers;
    const result = this.source();

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
  newProps,
  getProps,
  getSourceFunction,
  ReducerObject
};
