const isReducerConstant = require("./is-reducer-constant");
const { Reducer } = require("./Reducer");
const constant = require("./reducer-helpers/constant");

describe("isReducerConstant", () => {
  it("should testName", () => {
    expect(isReducerConstant(constant(true))).toEqual(true);
    expect(isReducerConstant(new Reducer())).toEqual(false);
  });
});
