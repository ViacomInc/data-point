function toNanoSeconds(hrtime) {
  return hrtime[0] * 1e9 + hrtime[1];
}

function getHighResolutionTime() {
  return toNanoSeconds(process.hrtime());
}

/**
 * @alias Span
 */
class Span {
  constructor(name, options, tracer) {
    this.root = false;
    this.name = name;
    this.parent = options.parent;
    this.context = options.context;
    this.tracer = tracer;
    this.timeStartNs = getHighResolutionTime();
    this.timeEndNs = undefined;
    this.errors = undefined;
    this.data = {};
  }

  start(name, options) {
    const span = new Span(name, options, this.tracer);
    this.tracer.handlers.start(span);
    return span;
  }

  setError(err) {
    this.error = err;
    if (typeof this.tracer.handlers.error === "function") {
      this.tracer.handlers.error(this, err);
    }
  }

  finish() {
    this.timeEndNs = getHighResolutionTime();

    if (typeof this.tracer.handlers.finish === "function") {
      this.tracer.handlers.finish(this);
    }
  }
}

module.exports = {
  toNanoSeconds,
  getHighResolutionTime,
  Span
};
