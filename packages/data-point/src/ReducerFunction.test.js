const { ReducerFunction } = require("./ReducerFunction");
const { Accumulator } = require("./Accumulator");

describe("ReducerFunction", () => {
  describe("constructor", () => {
    const fn = () => true;

    it("should set functionBody property", () => {
      const result = new ReducerFunction(fn);
      expect(result.functionBody).toEqual(fn);
    });

    it("should use function's name as the reducer's name", () => {
      const result = new ReducerFunction(fn);
      expect(result.name).toEqual("fn");
    });

    it("should use anonymous as the reducer's name if function does not have a name", () => {
      const result = new ReducerFunction(() => true);
      expect(result.name).toEqual("anonymous");
    });
  });

  describe("isType", () => {
    it("should be accessible as static method", () => {
      expect(ReducerFunction.isType).toBeInstanceOf(Function);
    });

    it("should return true for function reference", () => {
      expect(ReducerFunction.isType(() => true)).toEqual(true);
      expect(ReducerFunction.isType({})).toEqual(false);
      expect(ReducerFunction.isType("string")).toEqual(false);
      expect(ReducerFunction.isType([])).toEqual(false);
    });
  });

  describe("resolve", () => {
    it("should execute function", async () => {
      const fn = jest.fn(() => "result");
      const reducer = new ReducerFunction(fn);
      const acc = new Accumulator({
        value: "val"
      });
      const result = await reducer.resolve(acc);

      // return function's result
      expect(result).toEqual("result");
      // pass value and accumulator as parameters
      expect(fn).toBeCalledWith(acc.value, acc);
      // to use undefined as the value of "this"
      expect(fn.mock.instances).toEqual([undefined]);
    });
  });
});
