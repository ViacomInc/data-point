function toJSON(spans) {
  return spans.map(span => {
    return span.toJSON();
  });
}

function chromeTracer(spans) {
  const firstSpan = spans[0].toJSON();
  const timeStart = firstSpan.start;
  const traceEvents = spans.reduce((report, span) => {
    const spanJson = span.toJSON();
    report.push(
      // {
      //   cat: "data-point",
      //   pid: spanJson.pid,
      //   name: spanJson.name,
      //   ph: "b",
      //   ts: spanJson.start - timeStart,
      //   id: 0x100
      // },
      // {
      //   cat: "data-point",
      //   pid: spanJson.pid,
      //   name: spanJson.name,
      //   ph: "e",
      //   ts: spanJson.duration,
      //   id: 0x100
      // },
      {
        pid: spanJson.pid,
        tid: 1,
        ts: spanJson.start - timeStart,
        dur: spanJson.duration,
        ph: "X",
        name: `[${spanJson.pid}]${spanJson.name}`
      }
    );
    return report;
  }, []);

  return {
    traceEvents
  };
}

module.exports = {
  toJSON,
  chromeTracer
};
