/* eslint-env jest */

const ResolveEntity = require("./resolve");
const createReducer = require("../../reducer-types").create;
const resolveReducer = require("../../reducer-types").resolve;
const createReducerEntityId = require("../../reducer-types/reducer-entity-id")
  .create;

const FixtureStore = require("../../../test/utils/fixture-store");
const helpers = require("../../helpers");
const utils = require("../../utils");

let dataPoint;

const resolveEntity = (entityId, input, options) => {
  const racc = helpers.createAccumulator(input, options);
  const reducer = createReducerEntityId(createReducer, entityId);
  const entity = dataPoint.entities.get(entityId);
  return ResolveEntity.resolveEntity(
    dataPoint,
    resolveReducer,
    racc,
    reducer,
    entity
  );
};

beforeAll(() => {
  dataPoint = FixtureStore.create();
});

afterEach(() => {
  dataPoint.middleware.clear();
});

describe("getCurrentReducer", () => {
  it("should return reducer as is if type=ReducerEntity", () => {
    const reducer = {
      spec: "spec"
    };
    expect(ResolveEntity.getCurrentReducer(reducer)).toEqual(reducer);
  });
  it("should return decorated reducer if type!=ReducerEntity", () => {
    const reducer = {};
    expect(ResolveEntity.getCurrentReducer(reducer, "spec")).toEqual({
      spec: "spec"
    });
  });
});
describe("ResolveEntity.createCurrentAccumulatorWithOverride", () => {
  let acc;
  let spyGetUID;
  let entity;
  let reducer;
  beforeEach(() => {
    spyGetUID = jest.spyOn(utils, "getUID");
    spyGetUID.mockImplementationOnce(() => 10);
    reducer = createReducerEntityId(createReducer, "hash:base");
    entity = dataPoint.entities.get("hash:base");
    const accumulator = helpers.createAccumulator({
      foo: "bar"
    });
    accumulator.entityOverrides = {
      hash: {
        params: {
          inspect: true
        }
      }
    };
    acc = ResolveEntity.createCurrentAccumulator(accumulator, reducer, entity);
  });

  test("It should have entityOverrides", () => {
    expect(acc).toHaveProperty("params", { base: true, inspect: true });
  });
});

describe("ResolveEntity.createCurrentAccumulator", () => {
  let acc;
  let spyGetUID;
  let entity;
  let reducer;
  beforeEach(() => {
    spyGetUID = jest.spyOn(utils, "getUID");
    spyGetUID.mockImplementationOnce(() => 10);
    reducer = createReducerEntityId(createReducer, "hash:base");
    entity = dataPoint.entities.get("hash:base");
    const accumulator = helpers.createAccumulator({
      foo: "bar"
    });
    acc = ResolveEntity.createCurrentAccumulator(accumulator, reducer, entity);
  });
  test("It should set reducer property", () => {
    expect(acc).toHaveProperty("reducer");
  });

  test("It should create and set uid property", () => {
    expect(spyGetUID).toBeCalled();
    expect(acc).toHaveProperty("uid", "hash:base:10");
  });

  test("It should context as the current Entity", () => {
    expect(acc).toHaveProperty("context", entity);
  });
  test("It should initialValue acc.value", () => {
    expect(acc).toHaveProperty("initialValue", {
      foo: "bar"
    });
  });
  test("It should set an initialValue for acc.params", () => {
    expect(acc).toHaveProperty("params", entity.params);
  });
  test("It should override debug method", () => {
    expect(acc.debug).toBeInstanceOf(Function);
  });
});

describe("ResolveEntity.resolveEntity", () => {
  test("It should resolve entity", async () => {
    const result = await resolveEntity("model:asIs", "foo");
    expect(result).toBe("foo");
  });

  test("It should attach entityId to error", async () => {
    const rejectResolver = () => Promise.reject(new Error("test"));
    await expect(
      resolveEntity("hash:asIs", undefined, undefined, rejectResolver)
    ).rejects.toHaveProperty("entityId", "hash:asIs");
  });

  test("It should log trace calls when set to true", async () => {
    /* eslint-disable no-console */
    const consoleTime = console.time;
    const consoleTimeEnd = console.timeEnd;
    console.time = jest.fn();
    console.timeEnd = jest.fn();

    const result = await resolveEntity("model:traced", "foo", {
      trace: true
    });
    expect(console.time).toBeCalled();
    expect(console.timeEnd).toBeCalled();
    expect(console.time.mock.calls).toMatchSnapshot();
    expect(console.timeEnd.mock.calls).toMatchSnapshot();
    expect(result).toEqual("foo");
    console.time = consoleTime;
    console.timeEnd = consoleTimeEnd;
    /* eslint-enable no-console */
  });

  test("It should resolve through bypass", async () => {
    dataPoint.middleware.use("hash:before", (acc, next) => {
      next(null, { data: "bar" });
    });

    const result = await resolveEntity("hash:asIs", "foo");
    expect(result).toEqual({ data: "bar" });
  });

  test("it should catch errors from middleware", async () => {
    dataPoint.middleware.use("hash:before", () => {
      throw new Error("test");
    });
    await expect(resolveEntity("hash:asIs", "foo")).rejects.toHaveProperty(
      "message",
      "test"
    );
  });

  test("inputType - throws error if inputType does not pass", async () => {
    await expect(
      resolveEntity("model:c.0", "foo")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("inputType - if typeCheck passes then resolve normal", async () => {
    const result = await resolveEntity("model:c.0", 1);
    expect(result).toEqual(1);
  });
});

describe("ResolveEntity.resolveEntity outputType", () => {
  test("throws error if value does not pass typeCheck", async () => {
    await expect(
      resolveEntity("model:c.1", 1)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("throws error if before method returns value that does not pass typeCheck", async () => {
    await expect(
      resolveEntity("model:c.5", "some string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("throws error if middleware before returns value that does not pass typeCheck", async () => {
    dataPoint.middleware.use("model:before", (acc, next) => {
      next(null, 1);
    });

    await expect(
      resolveEntity("model:c.1", "some string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("throws error if global before middleware returns value that does not pass typeCheck", async () => {
    dataPoint.middleware.use("before", (acc, next) => {
      next(null, 1);
    });

    await expect(
      resolveEntity("model:c.1", "some string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("throws error if after method returns value that does not pass typeCheck", async () => {
    await expect(
      resolveEntity("model:c.4", "some string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("throws error if after middleware returns value that does not pass typeCheck", async () => {
    dataPoint.middleware.use("model:after", (acc, next) => {
      next(null, 1);
    });

    await expect(
      resolveEntity("model:c.1", "some string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("throws error if global after middleware returns value that does not pass typeCheck", async () => {
    dataPoint.middleware.use("after", (acc, next) => {
      next(null, 1);
    });

    await expect(
      resolveEntity("model:c.1", "some string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("passes if error method returns value with correct type", async () => {
    const result = await resolveEntity("model:c.6", "string");
    expect(result).toBe("error string");
  });

  test("throws if error method does not return value with correct type", async () => {
    await expect(
      resolveEntity("model:c.7", "string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("is bypassed if error throws error", async () => {
    await expect(
      resolveEntity("model:c.8", "string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("passes if error method catches typeCheck errors and returns value", async () => {
    const result = await resolveEntity("model:c.9", "string");
    expect(result).toBe("string from error");
  });

  test("fails if error method catches typeCheck errors and returns bad value", async () => {
    await expect(
      resolveEntity("model:c.10", "string")
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("resolves normally if typeCheck passes", async () => {
    const result = await resolveEntity("model:c.1", "foo");
    expect(result).toEqual("foo");
  });

  test("does not change acc.value", async () => {
    const result = await resolveEntity("model:c.2", "my string");
    expect(result).toEqual("my string");
  });

  test("throws error if custom typeCheck fails", async () => {
    await expect(
      resolveEntity("model:c.3", 123)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("does not attempt to execute outputType if it does not exists", async () => {
    const result = await resolveEntity("model:c.11");
    expect(result).toEqual("all good");
  });
});

describe("ResolveEntity.resolve", () => {
  const resolve = (entityId, input, options) => {
    const racc = helpers.createAccumulator(input, options);
    const reducer = createReducerEntityId(createReducer, entityId);
    const entity = dataPoint.entities.get(reducer.id);
    return ResolveEntity.resolve(
      dataPoint,
      resolveReducer,
      racc,
      reducer,
      entity
    );
  };

  test("It should resolve as single entity", async () => {
    const result = await resolve("model:asIs", "foo");
    expect(result).toEqual("foo");
  });

  test("It should resolve as collection", async () => {
    const result = await resolve("model:asIs[]", ["foo"]);
    expect(result).toEqual(["foo"]);
  });
  test("It should return undefined if accumulator is not Array", async () => {
    const result = await resolve("model:asIs[]", {});
    expect(result).toBeUndefined();
  });
  test("It should not execute resolver if flag hasEmptyConditional is true and value is empty", async () => {
    const result = await resolve("?model:asIs", undefined);
    expect(result).toBeUndefined();
  });

  test("It should execute resolver if flag hasEmptyConditional is true and value is not empty", async () => {
    const result = await resolve("?model:asIs", "foo");
    expect(result).toEqual("foo");
  });

  test("It should execute resolver only on non empty items of collection if hasEmptyConditional is set", async () => {
    const result = await resolve("?model:asIs[]", [
      "a",
      undefined,
      "b",
      null,
      "c"
    ]);
    expect(result).toEqual(["a", undefined, "b", null, "c"]);
  });
});

describe("entity lifecycle methods", () => {
  // modifies the given stack by reference
  function addMiddleware(stack) {
    dataPoint.middleware.use("before", (acc, next) => {
      stack.push("before [middleware]");
      next(null);
    });
    dataPoint.middleware.use("model:before", (acc, next) => {
      stack.push("model:before [middleware]");
      next(null);
    });
    dataPoint.middleware.use("model:after", (acc, next) => {
      stack.push("model:after [middleware]");
      next(null);
    });
    dataPoint.middleware.use("after", (acc, next) => {
      stack.push("after [middleware]");
      next(null);
    });
  }

  function pushToStack(stack, value) {
    stack.push(value);
    return stack;
  }

  test("It should resolve methods in the correct order with no error", async () => {
    const stack = [];

    addMiddleware(stack);

    const result = await dataPoint.resolve("model:lifecycles", [], {
      locals: {
        before: () => pushToStack(stack, "before"),
        value: () => pushToStack(stack, "value"),
        after: () => pushToStack(stack, "after"),
        error: () => pushToStack(stack, "error")
      }
    });

    expect(result).toEqual([
      "before [middleware]",
      "model:before [middleware]",
      "before",
      "value",
      "after",
      "model:after [middleware]",
      "after [middleware]"
    ]);
  });
  test("It should resolve methods in the correct order when error is thrown", async () => {
    const stack = [];

    addMiddleware(stack);

    dataPoint.middleware.use("model:before", () => {
      stack.push("model:before [middleware with error]");
      throw new Error();
    });

    const result = await dataPoint.resolve("model:lifecycles", [], {
      locals: {
        before: () => pushToStack(stack, "before"),
        value: () => pushToStack(stack, "value"),
        after: () => pushToStack(stack, "after"),
        error: () => pushToStack(stack, "error")
      }
    });

    expect(result).toEqual([
      "before [middleware]",
      "model:before [middleware]",
      "model:before [middleware with error]",
      "error"
    ]);
  });
});
