const { ReducerList } = require("./ReducerList");
const { Accumulator } = require("./Accumulator");

const mockCreateReducer = jest.fn(spec => {
  return (value, acc) => spec(value, acc);
});

const mockResolveReducer = jest.fn((acc, reducer) => {
  return reducer(acc.value, acc);
});

const reducer1 = val => `${val}-reducer1`;
const reducer2 = val => `${val}-reducer2`;
const reducer3 = val => `${val}-reducer3`;

afterEach(() => {
  jest.clearAllMocks();
});

describe("ReducerList", () => {
  describe("constructor", () => {
    const overSimplifiedCreateReducer = source => source;

    it("should have no name defined", () => {
      const reducer = new ReducerList([], overSimplifiedCreateReducer);
      expect(reducer.name).toEqual(undefined);
    });

    it("should set reducerList as a parsed set of reducers", () => {
      const reducer = new ReducerList([reducer1], overSimplifiedCreateReducer);
      expect(reducer.reducerList).toEqual([reducer1]);
    });
  });

  describe("isType", () => {
    it("should return true if source is array, false for non", () => {
      // kind of silly these tests since we are using native Array.isArray
      expect(ReducerList.isType([])).toEqual(true);
      expect(ReducerList.isType({})).toEqual(false);
      expect(ReducerList.isType("notArray")).toEqual(false);
    });
  });

  describe("resolve", () => {
    it("should resolve to undefined if no reducers provided", async () => {
      const reducer = new ReducerList([], mockCreateReducer);
      const acc = new Accumulator();

      expect(await reducer.resolve(acc)).toEqual(undefined);
    });

    it("should resolve single reducer", async () => {
      const reducer = new ReducerList([reducer1], mockCreateReducer);
      const acc = new Accumulator({
        value: "value"
      });

      expect(await reducer.resolve(acc, mockResolveReducer)).toEqual(
        "value-reducer1"
      );

      // should be called with original accumulator
      expect(mockResolveReducer).toBeCalledWith(acc, reducer.reducerList[0]);
    });

    it("should resolve multiple reducers", async () => {
      const reducer = new ReducerList(
        [reducer1, reducer2, reducer3],
        mockCreateReducer
      );
      const acc = new Accumulator({
        value: "value"
      });

      const spySet = jest.spyOn(acc, "set");

      expect(await reducer.resolve(acc, mockResolveReducer)).toEqual(
        "value-reducer1-reducer2-reducer3"
      );

      // should be called with original accumulator
      expect(mockResolveReducer).toBeCalledTimes(3);
      // get information from second call to mockResolveReducer
      const [arg1] = mockResolveReducer.mock.calls[1];
      // accumulator is a copy, not original
      expect(arg1).not.toEqual(acc);
      // new accumulator.value must be updated
      expect(arg1).toMatchObject({
        value: "value-reducer1"
      });

      // should only clone object when necessary
      expect(spySet).toBeCalledTimes(2);
    });
  });
});
