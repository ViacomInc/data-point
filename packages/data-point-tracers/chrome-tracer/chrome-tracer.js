const fs = require("fs").promises;

function toMicroSeconds(nanoseconds) {
  return nanoseconds / 1000;
}

function traceReport(spans) {
  const traceEvents = spans.map(span => {
    const timeStartMicro = toMicroSeconds(span.timeStartNs);
    const durationMicro = toMicroSeconds(span.timeEndNs) - timeStartMicro;

    const cat =
      span.root === true ? "root" : span.context.reducer.constructor.name;

    return {
      cat,
      ph: "X",
      name: span.name,
      ts: timeStartMicro,
      dur: durationMicro,
      pid: 1
    };
  });

  return {
    traceEvents,
    displayTimeUnit: "ms"
  };
}

class ChromeTracer {
  constructor() {
    this.spans = [];
  }

  static create() {
    return new ChromeTracer();
  }

  start(span) {
    this.spans.push(span);
  }

  async report(destinationPath) {
    const report = traceReport(this.spans);

    if (destinationPath) {
      await fs.writeFile(destinationPath, JSON.stringify(report, null, 2));
    }

    return report;
  }
}

module.exports = {
  traceReport,
  toMicroSeconds,
  ChromeTracer
};
