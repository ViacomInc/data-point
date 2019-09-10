const mockPid = jest.fn(() => "pid");

jest.mock("./unique-id-scope", () => {
  return () => mockPid;
});

jest.mock("./tracing/trace-span");

const { resolve } = require("./resolve");
const { Accumulator } = require("./Accumulator");
const traceSpan = require("./tracing/trace-span");

const reducer = {
  resolveReducer: jest.fn(() => "resolved")
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("resolve", () => {
  it("should return result of reducer.resolveReducer", async () => {
    const acc = new Accumulator();
    const result = await resolve(acc, reducer);
    expect(result).toEqual("resolved");
  });

  it("should append reducer and pid to accumulator", async () => {
    const acc = new Accumulator();
    await resolve(acc, reducer);
    const [accParam] = reducer.resolveReducer.mock.calls[0];
    expect(accParam).toMatchObject({
      pid: "pid",
      reducer
    });
  });

  describe("reducerStackTrace", () => {
    it("should augment error with reducer stacktrace", async () => {
      const acc = new Accumulator();

      const testError = new Error("resolveReducer failed");

      const reducerRejected = {
        id: "badReducer",
        resolveReducer: jest.fn().mockRejectedValue(testError)
      };

      const result = await resolve(acc, reducerRejected).catch(error => error);

      expect(result).toBeInstanceOf(Error);
      expect(result.reducerStackTrace).toEqual("badReducer");
    });

    it("should not augment error with reducer stacktrace if already set", async () => {
      const acc = new Accumulator();

      const testError = new Error("resolveReducer failed");
      testError.reducerStackTrace = "initialReducerStackTrace";

      const reducerRejected = {
        id: "badReducer",
        resolveReducer: jest.fn().mockRejectedValue(testError)
      };

      const result = await resolve(acc, reducerRejected).catch(error => error);

      expect(result).toBeInstanceOf(Error);
      expect(result.reducerStackTrace).toEqual("initialReducerStackTrace");
    });
  });

  describe("error.reducer", () => {
    it("should augment error with reducer", async () => {
      const acc = new Accumulator();

      const testError = new Error("resolveReducer failed");

      const reducerRejected = {
        id: "badReducer",
        resolveReducer: jest.fn().mockRejectedValue(testError)
      };

      const result = await resolve(acc, reducerRejected).catch(error => error);

      expect(result).toBeInstanceOf(Error);
      expect(result.reducer).toEqual(reducerRejected);
    });

    it("should not augment error with reducer if already set", async () => {
      const acc = new Accumulator();

      const testError = new Error("resolveReducer failed");
      testError.reducer = "initialReducer";

      const reducerRejected = {
        id: "badReducer",
        resolveReducer: jest.fn().mockRejectedValue(testError)
      };

      const result = await resolve(acc, reducerRejected).catch(error => error);

      expect(result).toBeInstanceOf(Error);
      expect(result.reducer).toEqual("initialReducer");
    });
  });

  describe("tracing", () => {
    it("should call traceSpan.start with accumulator", async () => {
      const acc = new Accumulator();
      await resolve(acc, reducer);
      const [accParam] = traceSpan.start.mock.calls[0];
      expect(accParam).toMatchObject({
        pid: "pid",
        reducer
      });
    });

    it("should call traceSpan.error when resolveReducer throws error", async () => {
      const acc = new Accumulator();

      const testError = new Error("resolveReducer failed");
      const reducerRejected = {
        resolveReducer: jest.fn().mockRejectedValue(testError)
      };

      await resolve(acc, reducerRejected).catch(error => error);

      expect(traceSpan.error).toBeCalled();

      expect(traceSpan.error.mock.calls[0]).toEqual([undefined, testError]);
    });

    it("should finally call traceSpan.finish()", async () => {
      const acc = new Accumulator();

      const reducerRejected = {
        resolveReducer: jest
          .fn()
          .mockRejectedValue(new Error("resolveReducer failed"))
      };

      await resolve(acc, reducerRejected).catch(error => error);

      expect(traceSpan.finish).toBeCalled();
    });
  });
});
