/* eslint-env jest */

describe("API", () => {
  it("should match API", () => {
    expect(require("./index")).toMatchSnapshot();
  });
});

describe("integration", () => {
  it("should create and resolve an entity-transform", () => {
    const dataPoint = require("../../core").create();
    const fooReducer = require("../entity-transform/factory").create(
      "$greeting"
    );
    const input = {
      greeting: "HelloWorld"
    };
    return dataPoint.resolve(fooReducer, input).then(value => {
      expect(value).toEqual("HelloWorld");
    });
  });
});
