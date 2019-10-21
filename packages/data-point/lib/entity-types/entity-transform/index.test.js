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
  it("should create and resolve an entity-transform", async () => {
    const dataPoint = core.create();
    const fooReducer = factory.create("$greeting");
    const input = {
      greeting: "HelloWorld"
    };
    const value = await dataPoint.resolve(fooReducer, input);
    expect(value).toEqual("HelloWorld");
  });
});
