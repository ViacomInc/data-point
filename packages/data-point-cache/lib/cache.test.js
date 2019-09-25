/* eslint-env jest */

jest.mock("./io-redis");

const _ = require("lodash");
const Cache = require("./cache");

beforeEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
});

describe("cache.normalizeMilliseconds", () => {
  it("should normalize to number if string provided", () => {
    expect(Cache.normalizeMilliseconds("10ms")).toEqual(10);
  });
  it("should pass as is if not string", () => {
    expect(Cache.normalizeMilliseconds(100)).toEqual(100);
  });
});

describe("cache.set", () => {
  it("should set in redis store", async () => {
    const redisSet = jest.fn(() => Promise.resolve(true));
    const localSet = jest.fn(() => Promise.resolve(true));

    const cache = {};
    _.set(cache, "redis.set", redisSet);
    _.set(cache, "local.set", localSet);
    _.set(cache, "settings.localTTL", 1000);

    await Cache.set(cache, "key", "value", "10ms");
    expect(redisSet).toBeCalledWith("key", "value", 10);
    expect(localSet).toBeCalledWith("key", "value", 1000);
  });

  it("should set in redis store with default ttl settings.localTTL when not provided", async () => {
    const redisSet = jest.fn(() => Promise.resolve(true));
    const localSet = jest.fn(() => Promise.resolve(true));

    const cache = {};
    _.set(cache, "redis.set", redisSet);
    _.set(cache, "local.set", localSet);
    _.set(cache, "settings.localTTL", 1000);

    await Cache.set(cache, "key", "value");
    expect(redisSet).toBeCalledWith("key", "value", 1200000);
    expect(localSet).toBeCalledWith("key", "value", 1000);
  });
});

describe("del", () => {
  it("should delete a key", () => {
    const placeholder = {
      redis: {
        del: jest.fn()
      }
    };
    Cache.del(placeholder, "foo");
    expect(placeholder.redis.del).toBeCalledWith("foo");
  });
});

describe("cache.getFromStore", () => {
  it("should return local value if found", async () => {
    const localGet = jest.fn(() => "localValue");
    const redisGet = jest.fn();

    const cache = {};
    _.set(cache, "local.get", localGet);
    _.set(cache, "redis.get", redisGet);

    const result = await Cache.getFromStore(cache, "key");
    expect(result).toEqual("localValue");
    expect(localGet).toBeCalledWith("key");
    expect(redisGet).not.toBeCalled();
  });

  it("should fetch from redis if local not found, only store locally if value found", async () => {
    const localGet = jest.fn(() => undefined);
    const localSet = jest.fn(() => undefined);
    const redisGet = jest.fn(() => Promise.resolve("remoteValue"));

    const cache = {};
    _.set(cache, "local.get", localGet);
    _.set(cache, "local.set", localSet);
    _.set(cache, "redis.get", redisGet);
    _.set(cache, "settings.localTTL", 1000);

    const result = await Cache.getFromStore(cache, "key");
    expect(result).toEqual("remoteValue");
    expect(localGet).toBeCalledWith("key");
    expect(redisGet).toBeCalledWith("key");
    expect(localSet).toBeCalledWith("key", "remoteValue", 1000);
  });

  it("should fetch from redis if local not found, skip local store if not found", async () => {
    const localGet = jest.fn(() => undefined);
    const localSet = jest.fn(() => undefined);
    const redisGet = jest.fn(() => Promise.resolve(undefined));

    const cache = {};
    _.set(cache, "local.get", localGet);
    _.set(cache, "local.set", localSet);
    _.set(cache, "redis.get", redisGet);
    _.set(cache, "settings.localTTL", 1000);

    const result = await Cache.getFromStore(cache, "key");
    expect(result).toEqual(undefined);
    expect(localGet).toBeCalledWith("key");
    expect(redisGet).toBeCalledWith("key");
    expect(localSet).not.toBeCalled();
  });
});

describe("create", () => {
  it("should create a cache client", async () => {
    const result = await Cache.create();
    expect(result.set).toBeInstanceOf(Function);
    expect(result.get).toBeInstanceOf(Function);
    expect(result.del).toBeInstanceOf(Function);
  });

  describe("cache.get", () => {
    it("should get key from store if key exists in redis store", async () => {
      const getFromStore = jest
        .spyOn(Cache, "getFromStore")
        .mockReturnValue(true);

      const del = jest.fn();

      const cache = {};
      _.set(cache, "redis.exists", () => Promise.resolve(true));
      _.set(cache, "local.del", del);
      await Cache.get(cache, "key");
      expect(getFromStore).toBeCalledWith(cache, "key");
      expect(del).not.toBeCalled();
    });
    it("should attempt deleting key from local if key does not exists in redis anymore", async () => {
      const getFromStore = jest
        .spyOn(Cache, "getFromStore")
        .mockReturnValue(true);

      const del = jest.fn();

      const cache = {};
      _.set(cache, "redis.exists", () => Promise.resolve(false));
      _.set(cache, "local.del", del);
      await Cache.get(cache, "key");
      expect(getFromStore).not.toBeCalled();
      expect(del).toBeCalledWith("key");
    });
  });

  describe("cache.del", () => {
    it("should delete key", async () => {
      const result = await Cache.create();
      // eslint-disable-next-line no-param-reassign
      result.redis.del = jest.fn();
      result.del("foo");
      expect(result.redis.del).toBeCalledWith("foo");
    });
  });
});
