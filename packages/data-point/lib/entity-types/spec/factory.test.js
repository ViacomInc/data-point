/* eslint-env jest */

const factory = require("./factory");

const EntityEntry = require("../entity-entry");

describe("reducer/reducer-entity-id#create", () => {
  const stub = () => {};
  test("throw if factory is not a function", () => {
    expect(() => {
      factory.create({}, "entry:abc");
    }).toThrowErrorMatchingSnapshot();
  });
  test("throw if resolve has wrong arity", () => {
    expect(() => {
      factory.create(stub, "entry:abc");
    }).toThrowErrorMatchingSnapshot();
  });
  test("entry", () => {
    const reducer = factory.create(EntityEntry, "entry:abc");
    expect(EntityEntry).toBe(reducer);
  });
});
