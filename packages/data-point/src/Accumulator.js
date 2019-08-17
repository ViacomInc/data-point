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
     * @type {Reducer} reference to the current reducer
     */
    this.reducer = options.reducer;

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

  resolve(reducers) {
    return this.__resolve(this, reducers);
  }
}

module.exports = {
  Accumulator
};
