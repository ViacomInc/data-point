/* eslint-env jest */

const Factory = require("./factory");
const createReducer = require("../../index").create;

describe("ReducerOmit#factory", () => {
  test("It should create a ReducerOmit object", () => {
    const args = ["$a", "$b"];
    const reducer = Factory.create(createReducer, args);
    expect(reducer).toBeInstanceOf(Factory.Constructor);
    expect(reducer.type).toBe(Factory.type);
    expect(reducer.keys).toEqual(args);
  });
});
