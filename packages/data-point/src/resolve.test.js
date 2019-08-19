const mockPid = jest.fn(() => "pid");

jest.mock("./unique-id-scope", () => {
  return () => mockPid;
});

jest.mock("./trace-span");

const { resolve } = require("./resolve");
const { Accumulator } = require("./Accumulator");
const traceSpan = require("./trace-span");

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

  describe("tracing", () => {
    it("should call traceSpan.create with accumulator", async () => {
      const acc = new Accumulator();
      await resolve(acc, reducer);
      const [accParam] = traceSpan.create.mock.calls[0];
      expect(accParam).toMatchObject({
        pid: "pid",
        reducer
      });
    });

    it("should call traceSpan.logError when resolveReducer throws error", async () => {
      const acc = new Accumulator();

      const reducerRejected = {
        resolveReducer: jest
          .fn()
          .mockRejectedValue(new Error("resolveReducer failed"))
      };

      await resolve(acc, reducerRejected).catch(error => error);

      expect(traceSpan.logError).toBeCalled();

      // first argument would is an undefined span
      expect(traceSpan.logError.mock.calls).toMatchInlineSnapshot(`
                Array [
                  Array [
                    undefined,
                    [Error: resolveReducer failed],
                  ],
                ]
            `);
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
