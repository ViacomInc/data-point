function toMS(hrtime) {
  const nanoseconds = hrtime[0] * 1e9 + hrtime[1];
  // return nanoseconds / 1e6;
  return nanoseconds / 1000;
}

class Span {
  constructor(name, options = {}) {
    this.spans = [];
    this.name = name;
    this.tags = new Map();
    this.__log = [];
    this.hrtimeStart = process.hrtime();
    this.childOf = options.childOf;
    this.tracer = null;
  }

  setTag(name, value) {
    this.tags.set(name, value);
    return this;
  }

  log(logObject) {
    this.__log.push(logObject);
  }

  finish() {
    this.hrtimeDuration = process.hrtime(this.hrtimeStart);
  }

  startSpan(name, options) {
    const span = new Span(name, options);
    span.tracer = this.tracer;

    span.tracer.spans.push(span);
    return span;
  }

  toJSON() {
    return {
      pid: this.tags.get("pid") || 0,
      name: this.name,
      start: toMS(this.hrtimeStart),
      duration: toMS(this.hrtimeDuration),
      tags: this.tags,
      log: this.__log,
      childOf: this.childOf
    };
  }
}

module.exports = Span;
