const traceSpan = require("./trace-span");
const { Accumulator } = require("./Accumulator");

describe("create", () => {
  it("should return undefined if tracer is not defined", () => {
    const acc = new Accumulator();
    expect(traceSpan.create(acc)).toEqual(undefined);
  });

  it("should return undefined if tracer.startSpan is not defined", () => {
    const acc = new Accumulator();
    acc.tracer = {};
    expect(traceSpan.create(acc)).toEqual(undefined);
  });

  describe("create span when defined", () => {
    // NOTE: grouping a couple of expect srtatements here to keep this tests
    // simple
    it("should create new span", () => {
      const acc = new Accumulator();

      acc.pid = "accPId";

      acc.reducer = {
        id: "reducerId"
      };

      const span = {
        setTag: jest.fn()
      };

      const tracer = {
        startSpan: jest.fn(() => span)
      };

      acc.tracer = tracer;

      // should return span
      expect(traceSpan.create(acc)).toEqual(span);
      // should set acc.tracer to new span
      expect(acc.tracer).toEqual(span);

      // tracer.startSpan should follow opentracing API
      expect(tracer.startSpan).toBeCalled();
      const [arg1, arg2] = tracer.startSpan.mock.calls[0];
      expect(arg1).toEqual("reducerId");
      // should set childOf relationship
      expect(arg2).toMatchObject({
        childOf: tracer
      });

      expect(span.setTag).toBeCalledWith("pid", "accPId");
    });
  });
});

describe("logError", () => {
  it("should do nothing if span is not set", () => {
    expect(() => {
      traceSpan.logError(undefined);
    }).not.toThrowError();
  });

  it("should do nothing if span.log is not set", () => {
    const span = {};
    expect(() => {
      traceSpan.logError(span);
    }).not.toThrowError();
  });

  it("should call span.log with error information", () => {
    const span = {
      log: jest.fn()
    };
    const error = new Error("test");
    traceSpan.logError(span, error);
    expect(span.log).toHaveBeenCalled();
    const arg1 = span.log.mock.calls[0][0];
    expect(arg1).toMatchObject({
      event: "error",
      "error.object": error,
      message: "test",
      stack: error.stack
    });
  });
});

describe("finish", () => {
  it("should do nothing if span is not set", () => {
    const span = undefined;
    expect(() => {
      traceSpan.finish(span);
    }).not.toThrowError();
  });

  it("should do nothing if span.finish is not set", () => {
    const span = {};
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
