const { ReducerParallel } = require("./parallel");
const { Accumulator } = require("../../Accumulator");
const { resolve } = require("../../resolve");
const { Reducer } = require("../../Reducer");

afterEach(() => {
  jest.clearAllMocks();
});

const multiplyByTwo = value => value * 2;
const multiplyByThree = value => value * 3;
const multiplyByFour = value => value * 4;

const parallelReducers = [multiplyByTwo, multiplyByThree, multiplyByFour];

describe("ReducerParallel", () => {
  describe("constructor", () => {
    it("should map and parse input source to an Array of reducers ", () => {
      const reducer = new ReducerParallel(parallelReducers);
      expect(reducer.parallelReducers).toBeInstanceOf(Array);

      reducer.parallelReducers.forEach(reducerItem => {
        expect(reducerItem).toBeInstanceOf(Reducer);
      });
    });
  });

  describe("create", () => {
    it("should create new instance", () => {
      const reducer = ReducerParallel.create(parallelReducers);
      expect(reducer).toBeInstanceOf(ReducerParallel);
    });
  });

  describe("resolve", () => {
    it("should return resolved input", async () => {
      const reducer = new ReducerParallel(parallelReducers);

      const acc = new Accumulator({
        value: 2
      });

      const result = await reducer.resolve(acc, resolve);
      expect(result).toEqual([4, 6, 8]);
    });
  });
});
