/* eslint-env jest */

const core = require("../../core");
const factory = require("../entity-transform/factory");
const transformIndex = require("./index");

describe("API", () => {
  it("should match API", () => {
    // eslint-disable-next-line global-require
    expect(transformIndex).toMatchSnapshot();
  });
});

describe("integration", () => {
  it("should create and resolve an entity-transform", () => {
    const dataPoint = core.create();
    const fooReducer = factory.create("$greeting");
    const input = {
      greeting: "HelloWorld"
    };
    return dataPoint.resolve(fooReducer, input).then(value => {
      expect(value).toEqual("HelloWorld");
    });
  });
});
