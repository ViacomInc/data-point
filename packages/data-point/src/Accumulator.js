/**
 * @class
 */
class Accumulator {
  constructor(options = {}) {
    /**
     * @type {any} Value being passed to the current reducer.
     */
    this.value = options.value;

    /**
     * @readonly
     * @type {Object} This object has properties that are accessible within
     *  the entire resolution. This is useful for providing
     *  application-level data.
     */
    this.locals = options.locals;

    /**
     * @readonly
     * @type {Object} cache object, should expose `get(cacheId, acc:Accumulator)`
     *  and `set(cacheId, acc:Accumulator)` methods.
     */
    this.cache = options.cache || {};

    /**
     * @readonly
     * @type {Span} For tracing, should comply with opentracer Span's API.
     */
    this.tracer = options.tracer;

    /**
     * @private
     * @type {string[]} stores the list of reducers executed per branch.
     */
    this.__reducerStackTrace = [];

    /**
     * @type {Number} current reducer process id, this number changes on the
     *  execution of every reducer but it is not bound to a reducer.
     */
    this.pid = options.pid;

    /**
     * @type {function} reference to main resolver.
     */
    Object.defineProperty(this, "__resolve", {
      writable: false,
      value: options.resolve
    });
  }

  /**
   * Creates a copy of the current instance.
   * @returns {Accumulator}
   */
  create() {
    return Object.create(this);
  }

  /**
   * Creates a new copy of the instance and sets a property to the new value
   * @private
   * @param {string} prop name of the property to set
   * @param {any} value value to set the property
   */
  set(prop, value) {
    const copy = this.create();
    copy[prop] = value;
    return copy;
  }

  /**
   * _getter_/_setter_ for the current reducer. When a new reducer is set, the
   * value is added to the `reducerStackTrace` property.
   * @member
   * @private
   * @type {Reducer}
   */
  set reducer(reducer) {
    this.__reducer = reducer;

    // we create a new array to create a new reducer history branch.
    this.__reducerStackTrace = this.__reducerStackTrace.concat(
      this.__reducer.id
    );
  }

  get reducer() {
    return this.__reducer;
  }

  /**
   * String formatted version of the current reducer stack trace.
   * @member
   * @readonly
   * @type {string}
   */
  get reducerStackTrace() {
    return this.__reducerStackTrace.join(" > ");
  }

  /**
   * Resolves a reducer against the current `value` of the accumulator.
   * @param {Reducer} reducer
   * @returns {Promise<any>} resolved value
   */
  resolve(reducer) {
    return this.__resolve(this, reducer);
  }
}

module.exports = {
  Accumulator
};
