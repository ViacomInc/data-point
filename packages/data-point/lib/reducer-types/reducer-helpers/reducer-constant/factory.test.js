/* eslint-env jest */

const Factory = require("./factory");
const createReducer = require("../../index").create;

describe("ReducerConstant#factory", () => {
  test("reducer with undefined as value", () => {
    const reducer = Factory.create(createReducer);
    expect(reducer).toBeInstanceOf(Factory.Constructor);
    expect(reducer.type).toBe(Factory.type);
    expect(reducer.value).toBe(undefined);
  });
  test("reducers with different value types", () => {
    expect(Factory.create(createReducer, null).value).toBe(null);
    expect(Factory.create(createReducer, 100).value).toBe(100);
    expect(Factory.create(createReducer, "string").value).toBe("string");
    expect(Factory.create(createReducer, ["a", "b"]).value).toEqual(["a", "b"]);
    expect(Factory.create(createReducer, { a: 1, b: 2 }).value).toEqual({
      a: 1,
      b: 2
    });
  });
});
