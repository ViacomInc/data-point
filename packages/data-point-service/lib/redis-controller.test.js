/* eslint-env jest */

const RedisController = require("./redis-controller");

describe("createSWRStaleKey", () => {
  it("should create stale key", () => {
    expect(RedisController.createSWRStaleKey("key")).toEqual("key:swr.stale");
  });
});

describe("createSWRStaleKey", () => {
  it("should create control key", () => {
    expect(RedisController.createSWRControlKey("key")).toEqual(
      "key:swr.control"
    );
  });
});

describe("getEntry", () => {
  it("should call cache.get from service to fetch a key", () => {
    const service = {
      cache: {
        get: key => Promise.resolve(`${key}:value`)
      }
    };
    return RedisController.getEntry(service, "test").then(result => {
      expect(result).toEqual("test:value");
    });
  });
});

describe("deleteEntry", () => {
  it("should call cache.del from service to delete a key", () => {
    const service = {
      cache: {
        del: jest.fn(() => Promise.resolve())
      }
    };
    return RedisController.deleteEntry(service, "test").then(() => {
      expect(service.cache.del).toBeCalledWith("test");
    });
  });
});

describe("getSWRStaleEntry", () => {
  it("should return true if key exists with valid wrapper ", () => {
    const service = {
      cache: {
        get: jest.fn(() => Promise.resolve("SWR-STALE"))
      }
    };
    return RedisController.getSWRStaleEntry(service, "test").then(result => {
      expect(service.cache.get).toBeCalledWith("test:swr.stale");
      expect(result).toEqual("SWR-STALE");
    });
  });
});

describe("getSWRControlEntry", () => {
  it("should return true if key exists with valid wrapper ", () => {
    const service = {
      cache: {
        get: jest.fn(() => Promise.resolve("SWR-CONTROL"))
      }
    };
    return RedisController.getSWRControlEntry(service, "test").then(result => {
      expect(service.cache.get).toBeCalledWith("test:swr.control");
      expect(result).toEqual("SWR-CONTROL");
    });
  });

  it("should return true if key exists with valid wrapper ", () => {
    const service = {
      cache: {
        get: jest.fn(() => Promise.resolve(undefined))
      }
    };
    return RedisController.getSWRControlEntry(service, "test").then(result => {
      expect(service.cache.get).toBeCalledWith("test:swr.control");
      expect(result).toEqual(undefined);
    });
  });
});

describe("setEntry", () => {
  it("should pass all arguments to cache.set", () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    };
    RedisController.setEntry(service, "key", "value", 200);
    expect(service.cache.set).toBeCalledWith("key", "value", 200);
  });
});

describe("setSWRStaleEntry", () => {
  it("should create a key that has no ttl", () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    };
    RedisController.setSWRStaleEntry(service, "key", "value", 100);
    expect(service.cache.set).toBeCalledWith("key:swr.stale", "value", 100);
  });
});

describe("setSWRControlEntry", () => {
  it("should create a key that has no ttl", () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    };
    RedisController.setSWRControlEntry(service, "key");
    expect(service.cache.set).toBeCalledWith(
      "key:swr.control",
      undefined,
      undefined
    );
  });

  it("should create a key that with ttl and value", () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    };
    RedisController.setSWRControlEntry(service, "key", 200, "SWR-CONTROL");
    expect(service.cache.set).toBeCalledWith(
      "key:swr.control",
      "SWR-CONTROL",
      200
    );
  });
});

describe("deleteSWRControlEntry", () => {
  it("should create a key that has no ttl", () => {
    const service = {
      cache: {
        del: jest.fn()
      }
    };
    RedisController.deleteSWRControlEntry(service, "key");
    expect(service.cache.del).toBeCalledWith("key:swr.control");
  });
});

describe("deleteSWRStaleEntry", () => {
  it("should delete a stale entry", () => {
    const service = {
      cache: {
        del: jest.fn()
      }
    };
    RedisController.deleteSWRStaleEntry(service, "key");
    expect(service.cache.del).toBeCalledWith("key:swr.stale");
  });
});
