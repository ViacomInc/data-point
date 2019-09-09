class OpenTracing {
  constructor(tracer) {
    this.tracer = tracer;
  }

  static create(tracer) {
    return new OpenTracing(tracer);
  }

  start(dpSpan) {
    const isRoot = dpSpan.root === true;

    let oTspan;

    if (isRoot) {
      oTspan = this.tracer.startSpan(dpSpan.name);
    } else {
      const parentSpan = dpSpan.parent;
      oTspan = this.tracer.startSpan(dpSpan.name, {
        childOf: parentSpan.data.span.context()
      });
    }

    // eslint-disable-next-line no-param-reassign
    dpSpan.data.span = oTspan;
  }

  // eslint-disable-next-line class-methods-use-this
  error(dpSpan, error) {
    // marks the span as an error
    dpSpan.data.span.setTag("error", "true");
    dpSpan.data.span.log({
      "error.description": error.message,
      "error.stack": error.stack
    });
  }

  // eslint-disable-next-line class-methods-use-this
  finish(dpSpan) {
    dpSpan.data.span.finish();
  }
}

module.exports = {
  OpenTracing
};
