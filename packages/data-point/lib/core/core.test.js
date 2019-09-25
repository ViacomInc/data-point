/* eslint-env jest */

const _ = require("lodash");

const core = require("./core");

const reducers = require("../../test/utils/reducers");
const entities = require("../../test/definitions/entities");

let instance;

beforeAll(() => {
  instance = core.create({
    values: {
      v1: "v1"
    },
    reducers: {
      test: reducers
    },
    entities
  });
});

test("api", () => {
  expect(Object.keys(instance)).toMatchSnapshot();
});

test("setup", () => {
  expect(instance.middleware.use).toBeTruthy();
  expect(_.isFunction(instance.use)).toBeTruthy();
  expect(instance.values.add).toBeTruthy();
  expect(instance.entities.add).toBeTruthy();

  expect(instance.values.store.v1).toEqual("v1");
  expect(instance.entities.store.has("request:a0.1")).toBeTruthy();
  expect(instance.entities.store.has("entry:a0")).toBeTruthy();
});

test("entry#transform - fail if id not found", done => {
  instance.transform("entry:INVALID", {}, {}, err => {
    /* eslint handle-callback-err: 0 */
    expect(_.isError(err)).toBeTruthy();
    expect(err.name).toBe("InvalidId");
    done();
  });
});

describe("addEntityType", () => {
  // eslint-disable-next-line no-unused-vars
  function entityFactory(id, spec) {
    return {
      id,
      // eslint-disable-next-line no-unused-vars
      resolve(accumulator, resolveReducer) {}
    };
  }

  test("It should add single new entity type", () => {
    const dataPoint = core.create();

    dataPoint.addEntityType("foo", entityFactory);

    const entityType = dataPoint.entityTypes.store.get("foo");
    expect(entityType).toEqual(entityFactory);
  });

  test("It should add multiple entity types", () => {
    const dataPoint = core.create();

    dataPoint.addEntityTypes({
      foo: entityFactory,
      bar: entityFactory
    });

    const store = dataPoint.entityTypes.store;
    expect(store.get("foo")).toEqual(entityFactory);
    expect(store.get("bar")).toEqual(entityFactory);
  });
});
