/* eslint-env jest */

const Factory = require("./factory");
const createReducer = require("../../index").create;

describe("ReducerParallel#factory", () => {
  test("It should create a ReducerParallel object", () => {
    const source = ["$a", () => true];
    const reducer = Factory.create(createReducer, source);
    expect(reducer).toBeInstanceOf(Factory.Constructor);
    expect(reducer.type).toBe(Factory.type);
    expect(reducer.reducers).toMatchSnapshot();
  });
});
