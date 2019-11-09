/* eslint-env jest */

const nock = require("nock");

const createReducerList = require("./index").create;
const resolveReducerList = require("./index").resolve;
const createReducer = require("../index").create;
const resolveReducer = require("../index").resolve;
const AccumulatorFactory = require("../../accumulator/factory");

const fixtureStore = require("../../../test/utils/fixture-store");
const testData = require("../../../test/data.json");

let manager;

beforeAll(() => {
  manager = fixtureStore.create();
});

describe("resolve#reducer.resolve - with valid reducers", () => {
  test("empty reducer list should return undefined", async () => {
    const accumulator = AccumulatorFactory.create({
      value: true
    });

    const reducerList = createReducerList(createReducer, []);

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    );
    expect(result).toBeUndefined();
  });

  test("one reducer", async () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    });

    const reducerList = createReducerList(createReducer, "$a.g");

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    );
    expect(result).toEqual(testData.a.g);
  });

  test("multiple reducers", async () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    });

    const reducerList = createReducerList(createReducer, "$a.g | $g1");

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    );
    expect(result).toBe(1);
  });
});

describe("resolve#reducer.resolve - reducer model", () => {
  test("simplest model", async () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    });

    const reducerList = createReducerList(createReducer, "hash:asIs");

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    );
    expect(result).toEqual(testData);
  });

  test("it returns original input after piping through hash:asIs", async () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    });

    const reducerList = createReducerList(
      createReducer,
      "hash:asIs | hash:a.1"
    );

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    );
    expect(result).toEqual(testData.a.h);
  });
});

describe("resolve#reducer.resolve - reducer request", () => {
  test("simplest request", async () => {
    nock("http://remote.test")
      .get("/source1")
      .reply(200, {
        ok: true
      });

    const accumulator = AccumulatorFactory.create({
      value: testData.foo
    });

    const reducerList = createReducerList(createReducer, "request:a1");

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    );
    expect(result).toEqual({
      ok: true
    });
  });

  test("multiple models for reducer request", async () => {
    nock("http://remote.test")
      .get("/source1")
      .reply(200, "http://remote.test/source2");

    nock("http://remote.test")
      .get("/source2")
      .reply(200, {
        ok: true
      });

    const accumulator = AccumulatorFactory.create({
      value: testData
    });

    const reducer = createReducerList(createReducer, "request:a1 | request:a3");

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducer
    );
    expect(result).toEqual({
      ok: true
    });
  });
});

describe("resolve#reducer.resolve - with falsy input", () => {
  const testFalsyInput = async (inputValue, expectedValue) => {
    const accumulator = AccumulatorFactory.create({
      value: inputValue
    });

    const functionA = jest.fn(input => `${input}1`);
    const functionB = jest.fn(input => `${input}2`);

    const reducerList = createReducerList(createReducer, [
      functionA,
      functionB
    ]);

    const result = await resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    );
    expect(result).toBe(expectedValue);
    expect(functionA).toHaveBeenCalledTimes(1);
    expect(functionB).toHaveBeenCalledTimes(1);
  };

  test("with undefined as input", () => {
    return testFalsyInput(undefined, "null12");
  });

  test("with null as input", () => {
    return testFalsyInput(null, "null12");
  });

  test("with zero as input", () => {
    return testFalsyInput(0, "012");
  });

  test("with an empty string as input", () => {
    return testFalsyInput("", "12");
  });
});
