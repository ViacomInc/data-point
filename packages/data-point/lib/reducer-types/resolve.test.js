/* eslint-env jest */

const Factory = require("./factory");
const Resolve = require("./resolve");

const reducers = require("../../test/utils/reducers");

const fixtureStore = require("../../test/utils/fixture-store");
const testData = require("../../test/data.json");

const AccumulatorFactory = require("../accumulator/factory");

let manager;

beforeAll(() => {
  manager = fixtureStore.create();
});

async function resolve(source, options, value) {
  const reducer = Factory.create(source, options);
  const accumulator = AccumulatorFactory.create({ value });
  try {
    return Resolve.resolve(manager, accumulator, reducer);
  } catch (e) {
    return e;
  }
}

describe("reducer#resolve", () => {
  test("It should work for valid input", async () => {
    const source = reducers.addCollectionValues();
    const value = testData.a.b.c;
    const options = {};
    const result = await resolve(source, options, value);
    expect(result).toEqual(6);
  });

  test("It should throw error for invalid input", async () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.a.b.c
    });

    const reducer = { type: "INVALID TYPE" };
    await expect(
      Resolve.resolve(manager, accumulator, reducer)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("It should return undefined when no default is provided", async () => {
    const source = "$a";
    const value = { a: undefined };
    const options = {};
    const result = await resolve(source, options, value);
    expect(result).toBeUndefined();
  });
});

describe("reducer#resolve with default value", () => {
  test("do not overwrite false", async () => {
    const source = "$a";
    const value = { a: false };
    const options = { default: 500 };
    const result = await resolve(source, options, value);
    expect(result).toBe(false);
  });
  test("do not overwrite true", async () => {
    const source = "$a";
    const value = { a: true };
    const options = { default: 500 };
    const result = await resolve(source, options, value);
    expect(result).toBe(true);
  });
  test("overwrite undefined", async () => {
    const source = "$a";
    const value = { a: undefined };
    const options = { default: 500 };
    const result = await resolve(source, options, value);
    expect(result).toBe(500);
  });
  test("overwrite undefined with function as default", async () => {
    const source = "$a";
    const value = { a: undefined };
    const options = { default: () => 500 };
    const result = await resolve(source, options, value);
    expect(result).toBe(500);
  });
});
