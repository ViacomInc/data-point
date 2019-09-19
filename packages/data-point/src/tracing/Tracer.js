const { Span } = require("./Span");

/**
 * @class
 */
class Tracer {
  constructor(handlers) {
    this.handlers = handlers;
  }

  start(name, options) {
    const span = new Span(name, options, this);
    span.root = true;

    this.handlers.start(span);
    return span;
  }
}

module.exports = Tracer;
