/* eslint-env jest */

const Factory = require("./factory");
const Resolve = require("./resolve");

const Reducer = require("../../index");

const DataPoint = require("../../../index");

const AccumulatorFactory = require("../../../accumulator/factory");

let manager;

beforeAll(() => {
  manager = DataPoint.create({
    entities: {
      "reducer:a": () => ({
        b: 22,
        c: 33
      })
    }
  });
});

describe("ReducerAssign#resolve", () => {
  test("It should work for empty objects", async () => {
    const accumulator = AccumulatorFactory.create({
      value: {}
    });

    const reducer = Factory.create(Reducer.create, () => ({}));
    const result = await Resolve.resolve(
      manager,
      Reducer.resolve,
      accumulator,
      reducer
    );
    expect(result).toEqual({});
  });

  test("It should work for valid input", async () => {
    const accumulator = AccumulatorFactory.create({
      value: {
        a: 1,
        b: 2
      }
    });

    const reducer = Factory.create(Reducer.create, "reducer:a");
    const result = await Resolve.resolve(
      manager,
      Reducer.resolve,
      accumulator,
      reducer
    );
    expect(result).toEqual({
      a: 1,
      b: 22,
      c: 33
    });
  });

  test("It should not merge nested objects", async () => {
    const accumulator = AccumulatorFactory.create({
      value: {
        a: 1,
        b: {
          a: 1
        }
      }
    });

    const reducer = Factory.create(Reducer.create, () => ({
      a: 1,
      b: {
        b: 2
      }
    }));

    const result = await Resolve.resolve(
      manager,
      Reducer.resolve,
      accumulator,
      reducer
    );
    expect(result).toEqual({
      a: 1,
      b: {
        b: 2
      }
    });
  });
});
