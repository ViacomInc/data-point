/* eslint-env jest */

const resolveSchemaEntity = require("./resolve").resolve;

const FixtureStore = require("../../../test/utils/fixture-store");

const helpers = require("../../helpers");

let dataPoint;
let resolveReducerBound;

function transform(entityId, value, options) {
  const reducer = dataPoint.entities.get(entityId);
  const accumulator = helpers.createAccumulator(
    value,
    Object.assign(
      {
        context: reducer
      },
      options
    )
  );
  return resolveSchemaEntity(accumulator, resolveReducerBound);
}

beforeAll(() => {
  dataPoint = FixtureStore.create();
  resolveReducerBound = helpers.createReducerResolver(dataPoint);
});

describe("schema.resolve", () => {
  test("handle failure errors", async () => {
    let error;
    try {
      await transform("schema:a.1.0", { foo: 1 });
    } catch (err) {
      error = err;
    }

    expect(error.name).toBe("InvalidSchema");
    expect(error.errors).toHaveLength(1);
  });

  test("pass context back if no errors", async () => {
    const promise = transform("schema:a.1.0", { foo: 1, bar: "1" });
    const result = await promise;
    expect(result).toEqual({ foo: 1, bar: "1" });
  });
});
