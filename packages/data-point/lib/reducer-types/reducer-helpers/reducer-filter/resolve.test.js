/* eslint-env jest */

const Factory = require("./factory");
const Resolve = require("./resolve");

const Reducer = require("../../index");

const DataPoint = require("../../../index");

const AccumulatorFactory = require("../../../accumulator/factory");

let manager;

beforeAll(() => {
  manager = DataPoint.create();
});

describe("ReducerFilter#resolve", () => {
  test("It should return empty array when reducer is empty reducer list", async () => {
    const value = [true, true];
    const accumulator = AccumulatorFactory.create({ value });
    const reducer = Factory.create(Reducer.create, []);
    const result = await Resolve.resolve(
      manager,
      Reducer.resolve,
      accumulator,
      reducer
    );
    expect(result).toEqual([]);
  });

  test("It should filter an array of objects", async () => {
    const value = [
      {
        a: 1
      },
      {
        a: 2
      }
    ];
    const accumulator = AccumulatorFactory.create({ value });
    const reducer = Factory.create(Reducer.create, ["$a", a => a > 1]);
    const result = await Resolve.resolve(
      manager,
      Reducer.resolve,
      accumulator,
      reducer
    );
    expect(result).toEqual([
      {
        a: 2
      }
    ]);
  });

  describe("ReducerFind#resolve with reducer objects", () => {
    test("it should filter values that resolve with falsy keys", async () => {
      const value = [
        {
          a: undefined
        },
        {
          a: "undefined"
        },
        {
          a: null
        },
        {
          a: ""
        },
        {
          a: 0
        },
        {
          a: "hello"
        },
        {
          a: 5
        },
        {
          a: NaN
        },
        {
          a: []
        },
        {
          a: {}
        }
      ];
      const accumulator = AccumulatorFactory.create({ value });
      const reducer = Factory.create(Reducer.create, {
        a: "$a"
      });
      const result = await Resolve.resolve(
        manager,
        Reducer.resolve,
        accumulator,
        reducer
      );
      expect(result).toEqual([
        {
          a: "undefined"
        },
        {
          a: 0
        },
        {
          a: "hello"
        },
        {
          a: 5
        },
        {
          a: []
        },
        {
          a: {}
        }
      ]);
    });
  });
});
