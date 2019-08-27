const { ReducerMap } = require("./map");
const { Accumulator } = require("../../Accumulator");
const { resolve } = require("../../resolve");

describe("ReducerMap", () => {
  const spec = value => value * 2;

  describe("constructor", () => {
    it("should set type to 'map'", () => {
      const reducer = new ReducerMap(spec);
      expect(reducer.type).toEqual("map");
    });

    it("should create a reducer from spec and assign to iterateeReducer", () => {
      const reducer = new ReducerMap(spec);
      expect(reducer.iterateeReducer).toHaveProperty("type", "function");
    });
  });

  describe("create", () => {
    it("should create a new instance of ReducerMap", () => {
      expect(ReducerMap.create(spec)).toBeInstanceOf(ReducerMap);
    });
  });

  describe("resolve", () => {
    it("should map reducers to each element on the provided array", async () => {
      const reducer = new ReducerMap(spec);

      const acc = new Accumulator({
        value: [1, 2, 3]
      });

      const result = await reducer.resolve(acc, resolve);
      expect(result).toEqual([2, 4, 6]);
    });
  });
});
