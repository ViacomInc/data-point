/* eslint-env jest */

const Factory = require("./factory");
const createReducer = require("../../index").create;
const { IS_REDUCER, DEFAULT_VALUE } = require("../../reducer-symbols");

describe("ReducerDefault#factory", () => {
  test("create with ReducerPath and string as default", () => {
    const reducer = Factory.create(createReducer, "$a", "DEFAULT_VALUE");
    expect(reducer[IS_REDUCER]).toBe(true);
    expect(reducer[DEFAULT_VALUE]).toEqual({ value: "DEFAULT_VALUE" });
    expect(reducer.type).toBe("ReducerPath");
  });
  test("create with ReducerPath and function as default", () => {
    const _default = () => "DEFAULT_VALUE";
    const reducer = Factory.create(createReducer, "$a", _default);
    expect(reducer[IS_REDUCER]).toBe(true);
    expect(reducer[DEFAULT_VALUE]).toEqual({ value: _default });
    expect(reducer.type).toBe("ReducerPath");
  });
});
