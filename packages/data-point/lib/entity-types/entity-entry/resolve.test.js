/* eslint-env jest */

const resolveEntryEntity = require("./resolve").resolve;

const FixtureStore = require("../../../test/utils/fixture-store");
const testData = require("../../../test/data.json");

const helpers = require("../../helpers");

let dataPoint;
let resolveReducerBound;

async function transform(entityId, value, options) {
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

  return resolveEntryEntity(accumulator, resolveReducerBound);
}

beforeAll(() => {
  dataPoint = FixtureStore.create();
  resolveReducerBound = helpers.createReducerResolver(dataPoint);
});

describe("Entry.resolve", () => {
  test("Entry#resolve - resolve empty", async () => {
    const result = await transform("entry:a0");
    expect(result).toEqual({});
  });
  test("Entry#resolve - resolve context", async () => {
    const result = await transform("entry:a1", testData.foo);
    expect(result).toEqual(1);
  });
});
