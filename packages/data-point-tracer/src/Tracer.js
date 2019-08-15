const Span = require("./Span");
const reporters = require("./reporters");

class Tracer {
  constructor() {
    this.spans = [];
  }

  startSpan(name, options) {
    const span = new Span(name, options);
    span.tracer = this;

    this.spans.push(span);
    return span;
  }

  report(reportType) {
    if (this.spans.length === 0) {
      return [];
    }
    switch (reportType) {
      case "chrome-tracing":
        return reporters.chromeTracer(this.spans);
      default:
        return reporters.toJSON(this.spans);
    }
  }
}

module.exports = Tracer;
