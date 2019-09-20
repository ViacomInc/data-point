/* eslint-env jest */

const factory = require("./factory");
const createReducer = require("../index").create;

test("reducer/reducer-function#isType", () => {
  expect(factory.isType("$foo")).toBe(false);
  expect(factory.isType("foo()")).toBe(false);
  expect(factory.isType(() => true)).toBe(true);
});

describe("reducer/reducer-function#validateFunction", () => {
  expect(factory.validateFunction(() => true)).toBe(true);
  expect(factory.validateFunction(value => true)).toBe(true);
  expect(factory.validateFunction((value, acc) => true)).toBe(true);
  expect(factory.validateFunction((value, acc, next) => true)).toBe(true);
  expect(() =>
    // 4 arguments is not a reducer
    factory.validateFunction((a, b, c, d) => true)
  ).toThrowErrorMatchingSnapshot();
});

describe("reducer/reducer-function#create", () => {
  test("function body", () => {
    const reducerFunction = () => value => value * 2;
    const reducer = factory.create(createReducer, reducerFunction);
    expect(reducer.body).toEqual(reducerFunction);
  });
});
