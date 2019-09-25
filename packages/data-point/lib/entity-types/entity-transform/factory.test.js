/* eslint-env jest */

const modelFactory = require("./factory");

test("modelFactory#create default", () => {
  const result = modelFactory.create("test", "$a");

  expect(result).toHaveProperty("id", "reducer:test");
  expect(result.value).toHaveProperty("type", "ReducerPath");
});
