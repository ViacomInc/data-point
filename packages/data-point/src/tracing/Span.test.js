const { toNanoSeconds, getHighResolutionTime, Span } = require("./Span");

const handlers = {
  start: jest.fn()
};

const tracer = {
  handlers
};

afterEach(() => {
  jest.clearAllMocks();
});

const mockHrtimeResult = [75238, 684529285];
const mockHighResolutionTime = 75238684529285;

describe("toNanoSeconds", () => {
  it("should convert hrtime to nanoseconds", () => {
    expect(toNanoSeconds(mockHrtimeResult)).toEqual(mockHighResolutionTime);
  });
});

describe("getHighResolutionTime", () => {
  it("should get nanoseconds from current hrtime", () => {
    const spyProcessHrtime = jest
      .spyOn(process, "hrtime")
      .mockReturnValue(mockHrtimeResult);

    expect(getHighResolutionTime()).toEqual(mockHighResolutionTime);

    spyProcessHrtime.mockRestore();
  });
});

describe("Span", () => {
  describe("constructor", () => {
    it("should set name", () => {
      expect(new Span("name", {}, tracer)).toHaveProperty("name", "name");
    });

    it("should set tracer", () => {
      expect(new Span("name", {}, tracer)).toHaveProperty("tracer", tracer);
    });

    it("should set timestamps", () => {
      const spyProcessHrtime = jest
        .spyOn(process, "hrtime")
        .mockReturnValue(mockHrtimeResult);

      const span = new Span("name", {}, tracer);
      expect(span).toHaveProperty("timeStartNs", mockHighResolutionTime);
      expect(span).toHaveProperty("timeEndNs", undefined);

      spyProcessHrtime.mockRestore();
    });
  });

  describe("start", () => {
    it("should create a span and call handlers.start", () => {
      const span = new Span("name", {}, tracer);
      const newSpan = span.start("newSpan", {
        context: {},
        parent: {}
      });
      expect(newSpan).toBeInstanceOf(Span);
      expect(newSpan).toHaveProperty("name", "newSpan");
      expect(handlers.start).toHaveBeenCalledWith(newSpan);
    });
  });

  describe("setError", () => {
    it("should set error", () => {
      const span = new Span("name", {}, tracer);
      const error = new Error("test");
      span.setError(error);
      expect(span).toHaveProperty("error", error);
    });

    it("should call tracer.handlers.error if available", () => {
      const tracerWithError = {
        handlers: {
          start: jest.fn(),
          error: jest.fn()
        }
      };

      const span = new Span("name", {}, tracerWithError);
      const error = new Error("test");
      span.setError(error);
      expect(tracerWithError.handlers.error).toHaveBeenCalledWith(span, error);
    });
  });

  describe("finish", () => {
    it("should set timeEndNs", () => {
      const span = new Span("name", {}, tracer);
      const spyProcessHrtime = jest
        .spyOn(process, "hrtime")
        .mockReturnValue(mockHrtimeResult);

      span.finish();
      expect(span).toHaveProperty("timeEndNs", mockHighResolutionTime);
      spyProcessHrtime.mockRestore();
    });

    it("should call tracer.handlers.finish if available", () => {
      const tracerWithFinish = {
        handlers: {
          start: jest.fn(),
          finish: jest.fn()
        }
      };

      const span = new Span("name", {}, tracerWithFinish);
      span.finish();
      expect(tracerWithFinish.handlers.finish).toHaveBeenCalledWith(span);
    });
  });
});
