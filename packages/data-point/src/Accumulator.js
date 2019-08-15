/**
 * class
 */
class Accumulator {
  constructor(options = {}) {
    this.value = options.value;
    this.locals = options.locals;
    this.cache = options.cache;
    this.tracer = options.tracer;

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
