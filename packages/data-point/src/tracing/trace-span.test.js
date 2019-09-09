const traceSpan = require("./trace-span");
const { Accumulator } = require("../Accumulator");

describe("start", () => {
  it("should return undefined if tracer is not defined", () => {
    const acc = new Accumulator();
    expect(traceSpan.start(acc)).toEqual(undefined);
  });

  describe("start span when defined", () => {
    // NOTE: grouping a couple of expect statements here to keep this tests
    // simple
    it("should start new span", () => {
      const acc = new Accumulator();

      acc.pid = "accPId";

      acc.reducer = {
        id: "reducerId"
      };

      const span = {
        setTag: jest.fn()
      };

      const tracer = {
        start: jest.fn(() => span)
      };

      acc.tracer = tracer;

      // should return span
      expect(traceSpan.start(acc)).toEqual(span);
      // should set acc.tracer to new span
      expect(acc.tracer).toEqual(span);

      expect(tracer.start).toBeCalledWith("reducerId", {
        context: acc,
        parent: tracer
      });
    });
  });
});

describe("error", () => {
  it("should do nothing if span is not set", () => {
    expect(() => {
      traceSpan.error(undefined);
    }).not.toThrowError();
  });

  it("should call span.setError with error object", () => {
    const span = {
      setError: jest.fn()
    };
    const error = new Error("test");
    traceSpan.error(span, error);
    expect(span.setError).toHaveBeenCalledWith(error);
  });
});

describe("finish", () => {
  it("should do nothing if span is not set", () => {
    const span = undefined;
    expect(() => {
      traceSpan.finish(span);
    }).not.toThrowError();
  });

  it("should call span.finish with error information", () => {
    const span = {
      finish: jest.fn()
    };
    traceSpan.finish(span);
    expect(span.finish).toHaveBeenCalled();
  });
});
