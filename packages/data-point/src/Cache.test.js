const cache = require("./Cache");

describe("isValidCacheMethod", () => {
  it("should return true on valid values", () => {
    expect(cache.isValidCacheMethod()).toEqual(true);
    expect(cache.isValidCacheMethod(() => true)).toEqual(true);
  });

  it("should return false on invalid values", () => {
    expect(cache.isValidCacheMethod(null)).toEqual(false);
    expect(cache.isValidCacheMethod({})).toEqual(false);
    expect(cache.isValidCacheMethod("")).toEqual(false);
  });
});

describe("Cache", () => {
  const Cache = cache.Cache;

  it("should initialize __set and __get", () => {
    const result = new Cache();
    expect(result).toHaveProperty("__get");
    expect(result).toHaveProperty("__set");
  });

  it("should set __get via get setter ", () => {
    const result = new Cache();
    const get = () => true;
    result.get = get;
    // eslint-disable-next-line no-underscore-dangle
    expect(result.__get).toEqual(get);
  });

  it("should set __set via set setter ", () => {
    const result = new Cache();
    const set = () => true;
    result.set = set;
    // eslint-disable-next-line no-underscore-dangle
    expect(result.__set).toEqual(set);
  });

  it("should throw error if get is invalid", () => {
    const result = new Cache();
    expect(() => {
      result.get = {};
    }).toThrowErrorMatchingInlineSnapshot(
      `"cache.get may only be a 'function' or 'undefined'"`
    );
  });

  it("should throw error if set is invalid", () => {
    const result = new Cache();
    expect(() => {
      result.set = {};
    }).toThrowErrorMatchingInlineSnapshot(
      `"cache.set may only be a 'function' or 'undefined'"`
    );
  });

  it("should get __get via get getter ", () => {
    const result = new Cache();
    const get = () => true;
    result.get = get;
    expect(result.get).toEqual(get);
  });

  it("should get __set via set getter ", () => {
    const result = new Cache();
    const set = () => true;
    result.set = set;
    expect(result.set).toEqual(set);
  });
});
