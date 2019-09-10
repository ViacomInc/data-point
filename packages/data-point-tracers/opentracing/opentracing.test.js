const { OpenTracing } = require("./opentracing");

const mockOpenTraceSpan = {
  context: jest.fn(() => "context"),
  setTag: jest.fn(),
  log: jest.fn(),
  finish: jest.fn()
};

const mockOpenTrace = {
  startSpan: jest.fn(() => mockOpenTraceSpan)
};

function createSpan() {
  return {
    name: "name",
    parent: {},
    data: {}
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("OpenTracing", () => {
  describe("constructor", () => {
    it("should set tracer", () => {
      const result = new OpenTracing("tracer");
      expect(result).toHaveProperty("tracer", "tracer");
    });
  });

  describe("create", () => {
    it("should create a new OpenTracing instance", () => {
      const result = OpenTracing.create("tracer");
      expect(result).toBeInstanceOf(OpenTracing);
      expect(result).toHaveProperty("tracer", "tracer");
    });
  });

  describe("start", () => {
    it("should create a new root span", () => {
      const result = new OpenTracing(mockOpenTrace);
      const span = createSpan();
      span.root = true;
      result.start(span);
      expect(mockOpenTrace.startSpan).toBeCalledTimes(1);
      expect(mockOpenTrace.startSpan).toBeCalledWith("name");
      // store span on `data` property
      expect(span.data).toHaveProperty("span", mockOpenTraceSpan);
    });

    it("should create a new child span", () => {
      const result = new OpenTracing(mockOpenTrace);
      const span = createSpan();
      span.parent = createSpan();
      span.parent.data.span = mockOpenTraceSpan;

      result.start(span);
      expect(mockOpenTrace.startSpan).toBeCalledTimes(1);
      expect(mockOpenTrace.startSpan).toBeCalledWith("name", {
        childOf: mockOpenTraceSpan.context()
      });
      // store span on `data` property
      expect(span.data).toHaveProperty("span", mockOpenTraceSpan);
    });
  });

  describe("error", () => {
    function callErrorAPI(error) {
      const result = new OpenTracing(mockOpenTrace);
      const span = createSpan();
      span.data.span = mockOpenTraceSpan;
      result.error(span, error);
      return span;
    }
    it("should set tag with error === 'true'", () => {
      const error = new Error("test");
      const span = callErrorAPI(error);
      expect(span.data.span.setTag).toBeCalledWith("error", "true");
    });

    it("should add error to log", () => {
      const error = new Error("test");
      const span = callErrorAPI(error);
      expect(span.data.span.log).toBeCalledWith({
        "error.description": error.message,
        "error.stack": error.stack
      });
    });
  });

  describe("finish", () => {
    it("should call span.finish()", () => {
      const result = new OpenTracing(mockOpenTrace);
      const span = createSpan();
      span.data.span = mockOpenTraceSpan;
      result.finish(span);
      expect(span.data.span.finish).toBeCalled();
    });
  });
});
