const Tracer = require("./Tracer");

const handlers = {
  start: jest.fn()
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("Tracer", () => {
  describe("constructor", () => {
    it("should set handlers", () => {
      expect(new Tracer(handlers)).toHaveProperty("handlers", handlers);
    });
  });

  describe("start", () => {
    it("should create root span", () => {
      const tracer = new Tracer(handlers);
      const span = tracer.start("name", {});
      expect(span).toHaveProperty("root", true);
    });

    it("should call handlers.start", () => {
      const tracer = new Tracer(handlers);
      const span = tracer.start("name", {});
      expect(handlers.start).toBeCalledWith(span);
    });
  });
});
