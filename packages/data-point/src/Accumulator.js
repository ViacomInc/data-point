/**
 * @module Accumulator
 */

/**
 * class Accumulator
 */
class Accumulator {
  constructor(options = {}) {
    /**
     * @type {any} Value being passed to the current reducer.
     */
    this.value = options.value;

    /**
     * @type {Object} This object has properties that are accessible
     * within the entire resolution. This is useful for providing
     * application-level data.
     */
    this.locals = options.locals;

    /**
     * @type {Object} cache object, should expose `get` and `set` methods.
     */
    this.cache = options.cache || {};

    /**
     * @type {Span} For tracing, should comply with opentracer Span's API.
     */
    this.tracer = options.tracer;

    /**
     * @type {string[]} stores the list of reducers executed per branch.
     */
    this.__reducerStackTrace = [];

    /**
     * @type {Number} current reducer process id, this number changes on the
     * execution of every reducer but it is not bound to a reducer.
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

  create() {
    return Object.create(this);
  }

  set(prop, value) {
    const copy = this.create();
    copy[prop] = value;
    return copy;
  }

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

  get reducerStackTrace() {
    return this.__reducerStackTrace.join(" > ");
  }

  resolve(reducers) {
    return this.__resolve(this, reducers);
  }
}

module.exports = {
  Accumulator
};
