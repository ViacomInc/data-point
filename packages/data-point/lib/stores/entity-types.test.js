/* eslint-env jest */

const _ = require("lodash");
const EntityType = require("./entity-types");

const FooEntityType = (id, spec) => {};

let entityTypes;

it("setup", () => {
  entityTypes = EntityType.create();
});

it("source#getStore", () => {
  const result = entityTypes.getStore();
  expect(_.isObject(result)).toBeTruthy();
});

it("source#add/get", () => {
  entityTypes.add("foo", FooEntityType);
  const doNotAllowOverride = _.attempt(entityTypes.add, "foo", () => {});
  expect(_.isError(doNotAllowOverride)).toBeTruthy();
});

it("source#get invalid id", () => {
  const result = _.attempt(entityTypes.get, "DOES_NOT_EXISTS");
  expect(result instanceof Error).toBeTruthy();
});

it("source#get", () => {
  entityTypes.add("request:a1", FooEntityType);
  const result = entityTypes.get("foo");
  expect(result).toEqual(FooEntityType);
});

it("teardown", () => {
  entityTypes.clear();
});
