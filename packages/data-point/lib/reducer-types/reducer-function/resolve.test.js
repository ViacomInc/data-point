/* eslint-env jest */

const reducerFactory = require("../factory");
const resolveFunction = require("./resolve");
const resolveReducer = require("../index").resolve;
const AccumulatorFactory = require("../../accumulator/factory");
const FixtureStore = require("../../../test/utils/fixture-store");

let dataPoint;

beforeAll(() => {
  dataPoint = FixtureStore.create();
});

describe("resolve#filter.resolve", () => {
  test("resolves node style callback", async () => {
    const accumulator = AccumulatorFactory.create({
      value: "test"
    });

    const reducer = reducerFactory.create((value, acc, done) =>
      done(null, `${value}node`)
    );

    const result = await resolveFunction.resolve(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    );

    expect(result).toBe("testnode");
  });

  test("resolves a sync function", async () => {
    const accumulator = AccumulatorFactory.create({
      value: "test"
    });

    const reducer = reducerFactory.create(value => `${value}sync`);

    const result = await resolveFunction.resolve(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    );

    expect(result).toBe("testsync");
  });

  test("resolves a promise function", async () => {
    const accumulator = AccumulatorFactory.create({
      value: "test"
    });

    const reducer = reducerFactory.create(value =>
      Promise.resolve(`${value}promise`)
    );

    const result = await resolveFunction.resolve(
      dataPoint,
      resolveReducer,
      accumulator,
      reducer
    );

    expect(result).toBe("testpromise");
  });

  test("rejects if callback passes error as first param", async () => {
    const accumulator = AccumulatorFactory.create({
      value: "test"
    });

    const reducer = reducerFactory.create((value, acc, done) => {
      return done(new Error("Test"));
    });

    await expect(
      resolveFunction.resolve(dataPoint, resolveReducer, accumulator, reducer)
    ).rejects.toHaveProperty("message", "Test");
  });
});
