/* eslint-env jest */

const _ = require("lodash");
const Promise = require("bluebird");

const mockDebug = jest.fn();
jest.mock("debug", () => {
  return () => mockDebug;
});

jest.mock("./stale-while-revalidate");
jest.mock("./entity-cache-params");
jest.mock("./redis-controller");

const StaleWhileRevalidate = require("./stale-while-revalidate");
const EntityCacheParams = require("./entity-cache-params");
const RedisController = require("./redis-controller");

const CacheMiddleware = require("./cache-middleware");

const createNext = (done, tests) =>
  jest.fn(() => {
    try {
      tests();
    } catch (error) {
      done(error);
      return;
    }
    done();
  });

function createContext() {
  const ctx = {
    locals: {
      req: {
        app: {
          locals: {}
        }
      }
    },
    context: {
      params: {},
      id: "model:Foo"
    }
  };

  return ctx;
}

beforeEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
});

describe("generateKey", () => {
  it("should generate default id", () => {
    const ctx = createContext();
    const result = CacheMiddleware.generateKey(null, ctx);
    expect(result).toEqual("entity:model:Foo");
  });

  it("should generate a key using cacheKey parameter", () => {
    const ctx = createContext();

    const cacheKey = acc => {
      return `custom:${acc.context.id}`;
    };

    const result = CacheMiddleware.generateKey(cacheKey, ctx);
    expect(result).toEqual("custom:model:Foo");
  });
});

describe("revalidateSuccess", () => {
  it("should remove local flag and add debug log", () => {
    const mockRemoveLocalRevalidationFlag = jest.fn();
    const service = _.set(
      {},
      "staleWhileRevalidate.removeLocalRevalidationFlag",
      mockRemoveLocalRevalidationFlag
    );
    CacheMiddleware.revalidateSuccess(service, "entityId", "entryKey")();
    expect(mockRemoveLocalRevalidationFlag).toBeCalledWith("entryKey");
    expect(mockDebug.mock.calls).toMatchSnapshot();
  });
});

describe("updateSWREntry", () => {
  it("should add stale entry", () => {
    const mockAddEntry = jest.fn();
    const service = _.set({}, "staleWhileRevalidate.addEntry", mockAddEntry);
    const value = "value";
    CacheMiddleware.updateSWREntry(service, "entryKey", "cache")(value);
    expect(mockAddEntry).toBeCalledWith("entryKey", "value", "cache");
    expect(mockDebug.mock.calls).toMatchSnapshot();
  });
});

describe("catchRevalidateError", () => {
  it("should handle revalidation error", () => {
    const mockClearAllRevalidationFlags = jest.fn(() => Promise.resolve(true));
    const spyConsoleError = jest.spyOn(console, "error").mockImplementation();
    const service = _.set(
      {},
      "staleWhileRevalidate.clearAllRevalidationFlags",
      mockClearAllRevalidationFlags
    );

    const error = new Error("test");

    return CacheMiddleware.catchRevalidateError(
      service,
      "entityId",
      "entryKey"
    )(error).then(() => {
      expect(mockClearAllRevalidationFlags).toBeCalledWith("entryKey");
      expect(spyConsoleError.mock.calls).toMatchSnapshot();
    });
  });

  it("should log errors when clearing flags fail", () => {
    const mockClearAllRevalidationFlags = jest.fn(() =>
      Promise.reject(new Error("revalidation"))
    );
    const spyConsoleError = jest.spyOn(console, "error").mockImplementation();
    const service = _.set(
      {},
      "staleWhileRevalidate.clearAllRevalidationFlags",
      mockClearAllRevalidationFlags
    );

    const error = new Error("test");

    return CacheMiddleware.catchRevalidateError(
      service,
      "entityId",
      "entryKey"
    )(error).then(() => {
      expect(mockClearAllRevalidationFlags).toBeCalledWith("entryKey");
      expect(spyConsoleError.mock.calls).toMatchSnapshot();
    });
  });
});

describe("shouldTriggerRevalidate", () => {
  it("should return false if staleEntry is not truthy", () => {
    expect(CacheMiddleware.shouldTriggerRevalidate(undefined)).toEqual(false);
  });
  it("should return false if revalidationState.hasExternalEntryExpired is not true", () => {
    const revalidationState = {
      hasExternalEntryExpired: false
    };
    expect(
      CacheMiddleware.shouldTriggerRevalidate(true, revalidationState)
    ).toEqual(false);
  });

  it("should return false if revalidationState.isRevalidatingLocally() is true", () => {
    const revalidationState = {
      hasExternalEntryExpired: true,
      isRevalidatingLocally: () => true
    };
    expect(
      CacheMiddleware.shouldTriggerRevalidate(true, revalidationState)
    ).toEqual(false);
  });

  it("should return true if revalidationState.isRevalidatingLocally() is true", () => {
    const revalidationState = {
      hasExternalEntryExpired: true,
      isRevalidatingLocally: () => false
    };
    expect(
      CacheMiddleware.shouldTriggerRevalidate(true, revalidationState)
    ).toEqual(true);
  });
});

describe("revalidateEntry", () => {
  const cache = {
    ttl: 200,
    staleWhileRevalidateTtl: 400,
    revalidateTimeout: 5000
  };

  function createMocks() {
    const mocks = {};

    mocks.updateSWREntry = jest
      .spyOn(CacheMiddleware, "updateSWREntry")
      .mockImplementation(() => () => Promise.resolve("updateSWREntry"));
    mocks.revalidateSuccess = jest
      .spyOn(CacheMiddleware, "revalidateSuccess")
      .mockImplementation(() => () => Promise.resolve("revalidateSuccess"));
    mocks.catchRevalidateError = jest
      .spyOn(CacheMiddleware, "catchRevalidateError")
      .mockImplementation(() => () => Promise.resolve("catchRevalidateError"));

    mocks.addRevalidationFlags = jest.fn(() => Promise.resolve("flags"));
    mocks.service = {};
    _.set(
      mocks.service,
      "staleWhileRevalidate.addRevalidationFlags",
      mocks.addRevalidationFlags
    );

    mocks.resolveFromAccumulator = jest.fn(() => Promise.resolve("resolved"));
    _.set(
      mocks.service,
      "dataPoint.resolveFromAccumulator",
      mocks.resolveFromAccumulator
    );

    return mocks;
  }

  it("should log at debug level start and success", () => {
    const mocks = createMocks();
    const ctx = createContext();
    return CacheMiddleware.revalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      ctx
    ).then(() => {
      expect(mockDebug.mock.calls).toMatchSnapshot();
    });
  });

  it("should call error handler when error thrown", () => {
    const mocks = createMocks();
    const error = new Error("resolved");
    mocks.resolveFromAccumulator.mockImplementation(() =>
      Promise.reject(error)
    );

    const errorHandler = jest.fn(() => true);
    mocks.catchRevalidateError.mockImplementation(() => errorHandler);

    const ctx = createContext();

    return CacheMiddleware.revalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      ctx
    ).then(() => {
      expect(mocks.catchRevalidateError).toBeCalledWith(
        mocks.service,
        "model:Foo",
        "entryKey"
      );
      expect(errorHandler).toBeCalledWith(error);
    });
  });

  it("should call dataPoint.resolveFromAccumulator with flagged context object", () => {
    const mocks = createMocks();
    const ctx = createContext();
    return CacheMiddleware.revalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      ctx
    ).then(() => {
      // original context should not be mutated
      expect(ctx).not.toHaveProperty("locals.revalidatingCache");

      // inspect arguments passed to dataPoint.resolveFromAccumulator
      const resolveFromAccumulatorArgs =
        mocks.resolveFromAccumulator.mock.calls[0];

      expect(resolveFromAccumulatorArgs[0]).toEqual(ctx.context);
      expect(resolveFromAccumulatorArgs[1]).toHaveProperty(
        "locals.revalidatingCache",
        {
          entryKey: "entryKey",
          entityId: "model:Foo"
        }
      );
    });
  });

  it("should call updateSWREntry", () => {
    const mocks = createMocks();
    const ctx = createContext();
    return CacheMiddleware.revalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      ctx
    ).then(() => {
      expect(mocks.updateSWREntry).toBeCalledWith(
        mocks.service,
        "entryKey",
        cache
      );
    });
  });

  it("should call revalidateSuccess", () => {
    const mocks = createMocks();
    const ctx = createContext();
    return CacheMiddleware.revalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      ctx
    ).then(() => {
      expect(mocks.revalidateSuccess).toBeCalledWith(
        mocks.service,
        "model:Foo",
        "entryKey"
      );
    });
  });
});

describe("isRevalidatingCacheKey", () => {
  it("should return false if revalidating property does not exists", () => {
    const ctx = createContext();
    ctx.locals.revalidatingCache = undefined;
    expect(CacheMiddleware.isRevalidatingCacheKey(ctx, "key")).toEqual(false);
  });
  it("should return false if revalidating key does not match current key", () => {
    const ctx = createContext();
    ctx.locals.revalidatingCache = {
      entryKey: "otherKey"
    };
    expect(CacheMiddleware.isRevalidatingCacheKey(ctx, "key")).toEqual(false);
  });
  it("should return true if revalidating key matches current key", () => {
    const ctx = createContext();
    ctx.locals.revalidatingCache = {
      entryKey: "key"
    };
    expect(CacheMiddleware.isRevalidatingCacheKey(ctx, "key")).toEqual(true);
  });
});

describe("resolveStaleWhileRevalidateEntry", () => {
  const cache = {
    ttl: 200,
    staleWhileRevalidateTtl: 400
  };

  function createMocks() {
    const mocks = {};
    mocks.isRevalidatingCacheKey = jest
      .spyOn(CacheMiddleware, "isRevalidatingCacheKey")
      .mockReturnValue(false);

    mocks.shouldTriggerRevalidate = jest
      .spyOn(CacheMiddleware, "shouldTriggerRevalidate")
      .mockReturnValue(false);

    mocks.revalidateEntry = jest
      .spyOn(CacheMiddleware, "revalidateEntry")
      .mockReturnValue(false);

    const service = {};

    _.set(service, "staleWhileRevalidate.invalidateLocalFlags", jest.fn());
    _.set(
      service,
      "staleWhileRevalidate.getRevalidationState",
      jest.fn(() => "revalidationState")
    );
    _.set(
      service,
      "staleWhileRevalidate.getEntry",
      jest.fn(() => "staleEntry")
    );

    mocks.service = service;
    mocks.ctx = createContext();
    mocks.setTimeout = jest.spyOn(global, "setTimeout").mockReturnValue(true);

    return mocks;
  }

  afterAll(() => {
    setTimeout.mockRestore();
  });

  it("should exit with undefined if isRevalidatingCacheKey is true", () => {
    const mocks = createMocks();
    // by default mock.isRevalidatingCacheKey is set to return false
    mocks.isRevalidatingCacheKey.mockReturnValue(true);

    const result = CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      mocks.ctx
    );
    expect(mocks.isRevalidatingCacheKey).toBeCalledWith(mocks.ctx, "entryKey");
    expect(result).toBeUndefined();
  });

  it("should create and attach staleWhileRevalidate instance to service object", () => {
    const mocks = createMocks();

    // this needs to be done since the createMocks creates one for us
    const staleWhileRevalidate = mocks.service.staleWhileRevalidate;
    delete mocks.service.staleWhileRevalidate;

    StaleWhileRevalidate.create.mockImplementation(() => staleWhileRevalidate);

    return CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      mocks.ctx
    ).then(() => {
      expect(StaleWhileRevalidate.create).toBeCalledWith(mocks.service);
      expect(mocks.service).toHaveProperty(
        "staleWhileRevalidate",
        staleWhileRevalidate
      );
    });
  });

  it("should call staleWhileRevalidate.create only once", () => {
    const mocks = createMocks();

    // this needs to be done since the createMocks creates one for us
    const staleWhileRevalidate = mocks.service.staleWhileRevalidate;
    delete mocks.service.staleWhileRevalidate;

    StaleWhileRevalidate.create.mockImplementation(() => staleWhileRevalidate);

    const results = [
      CacheMiddleware.resolveStaleWhileRevalidateEntry(
        mocks.service,
        "entryKey",
        cache,
        mocks.ctx
      ),
      CacheMiddleware.resolveStaleWhileRevalidateEntry(
        mocks.service,
        "entryKey",
        cache,
        mocks.ctx
      )
    ];
    return Promise.all(results).then(() => {
      expect(StaleWhileRevalidate.create).toHaveBeenCalledTimes(1);
    });
  });

  it("should call staleWhileRevalidate.invalidateLocalFlags on a new tick", () => {
    const mocks = createMocks();
    return CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      mocks.ctx
    ).then(() => {
      expect(mocks.setTimeout).toHaveBeenCalledWith(
        mocks.service.staleWhileRevalidate.invalidateLocalFlags,
        0
      );
    });
  });

  it("should return stale entry value and not call revalidateEntry if shouldTriggerRevalidate returns false", () => {
    const mocks = createMocks();

    mocks.shouldTriggerRevalidate.mockReturnValue(false);
    return CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      mocks.ctx
    ).then(result => {
      expect(mocks.shouldTriggerRevalidate).toHaveBeenCalledWith(
        "staleEntry",
        "revalidationState"
      );
      expect(result).toEqual("staleEntry");
    });
  });

  it("should return stale entry value and call revalidateEntry if shouldTriggerRevalidate returns true", () => {
    const mocks = createMocks();

    mocks.shouldTriggerRevalidate.mockReturnValue(true);
    return CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      "entryKey",
      cache,
      mocks.ctx
    ).then(result => {
      expect(mocks.revalidateEntry).toHaveBeenCalledWith(
        mocks.service,
        "entryKey",
        cache,
        mocks.ctx
      );
      expect(result).toEqual("staleEntry");
    });
  });
});

describe("setStaleWhileRevalidateEntry", () => {
  it("should add entry to staleWhileRevalidate controller", () => {
    const mockAddEntry = jest.fn(() => Promise.resolve(true));
    jest.spyOn(CacheMiddleware, "resolveStaleWhileRevalidate").mockReturnValue({
      addEntry: mockAddEntry
    });
    const service = {};
    return CacheMiddleware.setStaleWhileRevalidateEntry(
      service,
      "entryKey",
      "value",
      "cache"
    ).then(() => {
      expect(mockAddEntry).toBeCalledWith("entryKey", "value", "cache");
    });
  });
});

describe("before", () => {
  function createMocks() {
    const mocks = {};
    mocks.ctx = createContext();
    mocks.service = {};
    mocks.cache = {
      ttl: "20m",
      cacheKey: () => true,
      useStaleWhileRevalidate: true
    };
    mocks.next = jest.fn();

    mocks.getCacheParams = jest
      .spyOn(EntityCacheParams, "getCacheParams")
      .mockReturnValue(mocks.cache);

    mocks.generateKey = jest
      .spyOn(CacheMiddleware, "generateKey")
      .mockReturnValue("mockCacheKey");

    mocks.resolveStaleWhileRevalidateEntry = jest
      .spyOn(CacheMiddleware, "resolveStaleWhileRevalidateEntry")
      .mockReturnValue("staleResult");

    mocks.getEntry = jest
      .spyOn(RedisController, "getEntry")
      .mockReturnValue("noTTLEntry");

    mocks.deleteSWRStaleEntry = jest
      .spyOn(RedisController, "deleteSWRStaleEntry")
      .mockReturnValue(Promise.resolve());

    return mocks;
  }

  describe("exit to avoid cache process", () => {
    it("should call next and return false if no ttl", () => {
      const mocks = createMocks();
      mocks.cache.ttl = undefined;
      const result = CacheMiddleware.before(
        mocks.service,
        mocks.ctx,
        mocks.next
      );
      expect(result).toEqual(false);
      expect(mocks.next).toBeCalledWith();
    });
    it("should delete stale and call next returning false if resetCache is true", () => {
      const mocks = createMocks();
      mocks.ctx.locals.resetCache = true;
      const result = CacheMiddleware.before(
        mocks.service,
        mocks.ctx,
        mocks.next
      );
      expect(mocks.deleteSWRStaleEntry).toBeCalled();
      expect(result).toEqual(false);
      expect(mocks.next).toBeCalledWith();
    });
  });

  it("should resolve to stale value if cache.useStaleWhileRevalidate is true and stale value exists", done => {
    const mocks = createMocks();

    const next = createNext(done, () => {
      expect(next).toBeCalledWith(null, "staleResult");
      expect(mocks.resolveStaleWhileRevalidateEntry).toBeCalledWith(
        mocks.service,
        "mockCacheKey",
        mocks.cache,
        mocks.ctx
      );
      expect(mocks.getEntry).not.toBeCalled();
    });

    const result = CacheMiddleware.before(mocks.service, mocks.ctx, next);
    expect(result).toEqual(true);
  });

  it("should resolve to basic redis entry if cache.useStaleWhileRevalidate is false and value exists", done => {
    const mocks = createMocks();

    mocks.cache.useStaleWhileRevalidate = false;

    const next = createNext(done, () => {
      expect(next).toBeCalledWith(null, "noTTLEntry");
      expect(mocks.resolveStaleWhileRevalidateEntry).not.toBeCalled();
      expect(mocks.getEntry).toBeCalledWith(mocks.service, "mockCacheKey");
    });

    const result = CacheMiddleware.before(mocks.service, mocks.ctx, next);
    expect(result).toEqual(true);
  });

  it("should not call ctx.resolve if stale value does not exists", done => {
    const mocks = createMocks();

    const next = createNext(done, () => {
      expect(next).toBeCalledWith(null);
      expect(mocks.resolveStaleWhileRevalidateEntry).toBeCalledWith(
        mocks.service,
        "mockCacheKey",
        mocks.cache,
        mocks.ctx
      );
    });

    mocks.resolveStaleWhileRevalidateEntry.mockReturnValue(undefined);
    const result = CacheMiddleware.before(mocks.service, mocks.ctx, next);
    expect(result).toEqual(true);
  });
});

describe("after", () => {
  function createMocks() {
    const mocks = {};
    mocks.ctx = createContext();
    mocks.ctx.value = "resolvedValue";
    mocks.service = {};
    mocks.cache = {
      ttl: "20m",
      cacheKey: () => true,
      useStaleWhileRevalidate: true
    };

    mocks.next = jest.fn();

    mocks.getCacheParams = jest
      .spyOn(EntityCacheParams, "getCacheParams")
      .mockReturnValue(mocks.cache);

    mocks.generateKey = jest
      .spyOn(CacheMiddleware, "generateKey")
      .mockReturnValue("mockCacheKey");

    mocks.setStaleWhileRevalidateEntry = jest
      .spyOn(CacheMiddleware, "setStaleWhileRevalidateEntry")
      .mockImplementation(() => Promise.resolve());

    mocks.setEntry = jest
      .spyOn(RedisController, "setEntry")
      .mockImplementation(() => Promise.resolve(true));

    return mocks;
  }

  describe("exit to avoid cache process", () => {
    it("should call next and return false if no ttl", () => {
      const mocks = createMocks();
      mocks.cache.ttl = undefined;
      const result = CacheMiddleware.after(
        mocks.service,
        mocks.ctx,
        mocks.next
      );
      expect(result).toEqual(false);
      expect(mocks.next).toBeCalledWith();
    });

    it("should call next and return false if no ttl", () => {
      const mocks = createMocks();
      mocks.ctx.locals.revalidatingCache = true;
      const result = CacheMiddleware.after(
        mocks.service,
        mocks.ctx,
        mocks.next
      );
      expect(result).toEqual(false);
      expect(mocks.next).toBeCalledWith();
    });
  });

  it("should set stale value if cache.useStaleWhileRevalidate is true", done => {
    const mocks = createMocks();

    const next = createNext(done, () => {
      expect(mocks.setStaleWhileRevalidateEntry).toBeCalledWith(
        mocks.service,
        "mockCacheKey",
        "resolvedValue",
        mocks.cache
      );
      expect(mocks.setEntry).not.toBeCalled();
    });

    mocks.cache.useStaleWhileRevalidate = true;
    const result = CacheMiddleware.after(mocks.service, mocks.ctx, next);
    expect(result).toEqual(true);
  });

  it("should call next with only 1 argument to avoid exiting the middleware chain", done => {
    const mocks = createMocks();

    const next = createNext(done, () => {
      expect(next).toBeCalledWith(null);
    });

    mocks.cache.useStaleWhileRevalidate = false;
    const result = CacheMiddleware.after(mocks.service, mocks.ctx, next);
    expect(result).toEqual(true);
  });

  it("should set basic redis entry value if cache.useStaleWhileRevalidate is false", done => {
    const mocks = createMocks();

    const next = createNext(done, () => {
      expect(mocks.setStaleWhileRevalidateEntry).not.toBeCalled();
      expect(mocks.setEntry).toBeCalledWith(
        mocks.service,
        "mockCacheKey",
        "resolvedValue",
        mocks.cache.ttl
      );
    });

    mocks.cache.useStaleWhileRevalidate = false;
    const result = CacheMiddleware.after(mocks.service, mocks.ctx, next);
    expect(result).toEqual(true);
  });

  describe("handle error", () => {
    it("should call next with error value if setStaleWhileRevalidateEntry fails", done => {
      const mocks = createMocks();

      const error = new Error("failed");
      mocks.setStaleWhileRevalidateEntry.mockImplementation(() =>
        Promise.reject(error)
      );

      const next = createNext(done, () => {
        expect(next).toBeCalledWith(error);
      });

      mocks.cache.useStaleWhileRevalidate = true;
      const result = CacheMiddleware.after(mocks.service, mocks.ctx, next);
      expect(result).toEqual(true);
    });

    it("should call next with error value if setEntry fails", done => {
      const mocks = createMocks();

      const error = new Error("failed");
      mocks.setEntry.mockImplementation(() => Promise.reject(error));

      const next = createNext(done, () => {
        expect(next).toBeCalledWith(error);
      });

      mocks.cache.useStaleWhileRevalidate = false;
      const result = CacheMiddleware.after(mocks.service, mocks.ctx, next);
      expect(result).toEqual(true);
    });
  });
});
