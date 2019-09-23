/* eslint-env jest */

const {
  validateProperties,
  validateModifiers
} = require("./validate-modifiers");

describe("validateProperties", () => {
  test("It should throw error if keys do not match", () => {
    expect(() => {
      const spec = {
        foo: true
      };
      validateProperties("foo:test", spec, ["bar"]);
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      const spec = {
        bar: true,
        foo: true
      };
      validateProperties("foo:test", spec, ["bar"]);
    }).toThrowErrorMatchingSnapshot();
  });

  test("It should do nothing if using all valid keys", () => {
    let spec = {
      bar: true
    };
    expect(validateProperties("foo:test", spec, ["bar"])).toBeTruthy();

    spec = {};
    expect(validateProperties("foo:test", spec, ["bar"])).toBeTruthy();
  });
});

describe("validateModifiers", () => {
  test("It should include base modifiers", () => {
    expect(() => {
      const spec = {
        inputType: true,
        outputType: true,
        before: true,
        after: true,
        error: true,
        value: true,
        foo: true
      };
      validateModifiers("foo:test", spec, ["bar"]);
    }).toThrowErrorMatchingSnapshot();
  });
});
