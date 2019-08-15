/**
 * @class
 */
class Accumulator {
  constructor(options) {
    this.value = options.value;
    this.locals = options.locals;
    this.cache = options.cache;
    this.tracer = options.tracer;

    Object.defineProperty(this, "__resolve", {
      writable: false,
      value: options.resolve
    });
  }

  set(prop, value) {
    const copy = this.create();
    copy[prop] = value;
    return copy;
  }

  create() {
    return Object.create(this);
  }

  resolve(reducers) {
    this.__resolve(this, reducers);
  }
}

/**
 * creates new Accumulator based on spec
 * @param  {Object} spec - accumulator spec
 * @return {Source}
 */
function create(spec) {
  return new Accumulator(spec);
}

module.exports = {
  Accumulator,
  create
};
