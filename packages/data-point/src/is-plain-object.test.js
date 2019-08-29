const isPlainObject = require("./is-plain-object");

describe("isPlainObject", () => {
  it("should return true for plain objects", () => {
    expect(isPlainObject({})).toEqual(true);
    expect(isPlainObject("string")).toEqual(false);
    expect(isPlainObject(123)).toEqual(false);
    expect(isPlainObject(null)).toEqual(false);
    expect(isPlainObject([])).toEqual(false);
    expect(isPlainObject(() => true)).toEqual(false);

    expect(isPlainObject(Object.create({}))).toEqual(false);
    class Test {}
    expect(isPlainObject(new Test())).toEqual(false);
  });
});
