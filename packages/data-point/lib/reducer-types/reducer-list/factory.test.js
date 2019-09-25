/* eslint-env jest */

const _ = require("lodash");
const factory = require("./factory");
const createReducer = require("../index").create;

describe("factory#create", () => {
  test("factory#create only path", () => {
    const result = factory.create(createReducer, "$foo.bar");
    expect(result.reducers).toHaveLength(1);

    const reducer = _.first(result.reducers);
    expect(reducer.type).toBe("ReducerPath");
    expect(reducer.name).toBe("foo.bar");
    expect(reducer.asCollection).toBe(false);
  });

  test("factory#create path as collection", () => {
    const result = factory.create(createReducer, "$foo.bar[]");
    expect(result.reducers).toHaveLength(1);

    const reducer = _.first(result.reducers);
    expect(reducer.type).toBe("ReducerPath");
    expect(reducer.name).toBe("foo.bar");
    expect(reducer.asCollection).toBe(true);
  });

  test("it should create a ReducerList with reducers using a piped reducer", () => {
    const result = factory.create(createReducer, [
      "$foo.bar | reducer:add",
      () => true
    ]);

    expect(result.reducers).toHaveLength(3);
    expect(result.reducers[0].type).toBe("ReducerPath");
    expect(result.reducers[1].type).toBe("ReducerEntityId");
    expect(result.reducers[2].type).toBe("ReducerFunction");
  });

  test("it should create a ReducerList with reducers using a piped reducer with multiple spaces", () => {
    const result = factory.create(createReducer, [
      "$foo.bar  |     reducer:add   ",
      () => true
    ]);

    expect(result.reducers).toHaveLength(3);
    expect(result.reducers[0].type).toBe("ReducerPath");
    expect(result.reducers[1].type).toBe("ReducerEntityId");
    expect(result.reducers[2].type).toBe("ReducerFunction");
  });

  test("It should create a ReducerList with reducers using an array of reducers", () => {
    const result = factory.create(createReducer, [
      "$foo.bar",
      "reducer:add",
      () => true
    ]);

    expect(result.reducers).toHaveLength(3);
    expect(result.reducers[0].type).toBe("ReducerPath");
    expect(result.reducers[1].type).toBe("ReducerEntityId");
    expect(result.reducers[2].type).toBe("ReducerFunction");
  });
});

describe("factory#create", () => {
  test("factory#create reducer from empty array", () => {
    const result = factory.create(createReducer, []);
    expect(result.reducers).toHaveLength(0);
  });

  test("factory#create reducer from single function", () => {
    const result = factory.create(createReducer, value => value);
    expect(result.reducers).toHaveLength(1);
    expect(result.reducers[0].type).toBe("ReducerFunction");
  });

  test("factory#create reducer from string", () => {
    const result = factory.create(createReducer, ["$foo", "$bar"]);
    expect(result.reducers).toHaveLength(2);
    expect(result.reducers[0].type).toBe("ReducerPath");
    expect(result.reducers[1].type).toBe("ReducerPath");
  });

  test("factory#create reducer from grouped reducers and single reducers", () => {
    const result = factory.create(createReducer, ["$foo | $bar", "$baz"]);
    expect(result.reducers).toHaveLength(3);
    expect(result.reducers[0].type).toBe("ReducerPath");
    expect(result.reducers[1].type).toBe("ReducerPath");
    expect(result.reducers[2].type).toBe("ReducerPath");
  });

  test("factory#create reducer from grouped reducers with multiple leading/trailing spaces", () => {
    const result = factory.create(createReducer, [
      "     $foo    |    $bar    |     $baz    "
    ]);
    expect(result.reducers).toHaveLength(3);
    expect(result.reducers[0].type).toBe("ReducerPath");
    expect(result.reducers[1].type).toBe("ReducerPath");
    expect(result.reducers[2].type).toBe("ReducerPath");
  });

  test("factory#create errors if invalid reducer type", () => {
    const result = _.attempt(factory.create, createReducer, 1);

    expect(result).toBeInstanceOf(Error);
  });

  test("factory#create reducer from array", () => {
    const result = factory.create(createReducer, [
      "$foo.bar",
      "reducer:add | $foo.bar.zeta",
      value => value
    ]);

    expect(result.reducers).toHaveLength(4);
    expect(result.reducers[0].type).toBe("ReducerPath");
    expect(result.reducers[1].type).toBe("ReducerEntityId");
    expect(result.reducers[2].type).toBe("ReducerPath");
    expect(result.reducers[3].type).toBe("ReducerFunction");
  });

  test("should throw error if reducer is false", () => {
    expect(() =>
      factory.create(createReducer, [false])
    ).toThrowErrorMatchingSnapshot();
  });

  test("should throw error if reducer is empty string", () => {
    expect(() =>
      factory.create(createReducer, "")
    ).toThrowErrorMatchingSnapshot();
  });

  test("should throw error if reducer is non-empty string with no matching reducer", () => {
    expect(() =>
      factory.create(createReducer, "asdf")
    ).toThrowErrorMatchingSnapshot();
  });

  test("should throw error if one of two reducers is false", () => {
    expect(() =>
      factory.create(createReducer, ["$foo.bar", false])
    ).toThrowErrorMatchingSnapshot();
  });

  test("should throw error if reducer is undefined", () => {
    expect(() =>
      factory.create(createReducer, [undefined])
    ).toThrowErrorMatchingSnapshot();
  });

  test("should throw error if reducer is zero", () => {
    expect(() =>
      factory.create(createReducer, [0])
    ).toThrowErrorMatchingSnapshot();
  });
});
