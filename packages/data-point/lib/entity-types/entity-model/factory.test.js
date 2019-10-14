/* eslint-env jest */

const Factory = require("./factory");

test("Factory#create", () => {
  const obj = Factory.create("name", {
    value: ["$foo", () => {}]
  });

  expect(obj).toHaveProperty("value");
});
