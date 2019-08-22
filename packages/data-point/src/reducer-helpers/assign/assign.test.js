const { ReducerAssign } = require("./assign");
const { Accumulator } = require("../../Accumulator");
const { resolve } = require("../../resolve");

describe("ReducerAssign", () => {
  describe("constructor", () => {
    it("should set type to 'constant'", () => {
      const reducer = new ReducerAssign({});
      expect(reducer.type).toEqual("assign");
    });

    it("should create a reducer from spec and assign to assignReducer", () => {
      const reducer = new ReducerAssign({});
      expect(reducer.assignReducer).toHaveProperty("type", "object");
    });
  });

  describe("create", () => {
    it("should create a new instance of ReducerAssign", () => {
      expect(ReducerAssign.create({})).toBeInstanceOf(ReducerAssign);
    });
  });

  describe("resolve", () => {
    it("should merge result from reducer with current value of accumulator", async () => {
      const specMerger = {
        source: () => true,
        overridden: () => true
      };

      const reducer = new ReducerAssign(specMerger);

      const input = {
        input: true,
        overridden: false
      };

      const acc = new Accumulator({
        value: input
      });

      const result = await reducer.resolve(acc, resolve);

      expect(result).toEqual({
        input: true,
        source: true,
        overridden: true
      });

      // input should not be mutated
      expect(input).toEqual({
        input: true,
        overridden: false
      });
    });
  });
});
