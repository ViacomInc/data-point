/* eslint-disable no-console */
/* eslint-env jest */

const _ = require("lodash");
const nock = require("nock");
const FixtureStore = require("../../test/utils/fixture-store");
const TestData = require("../../test/data.json");
const Model = require("./entity-model");
const TraceGraph = require("../trace/trace-graph");

let dataPoint;

beforeAll(() => {
  dataPoint = FixtureStore.create();
});

beforeEach(() => {
  dataPoint.middleware.clear();
});

test("Entry#resolve - branch/leaf nesting", async () => {
  const result = await dataPoint.resolve("hash:branchLeafNesting", TestData);
  expect(result).toEqual({
    label: "1",
    leafs: [
      {
        label: "1.0",
        leafs: []
      },
      {
        label: "1.1",
        leafs: [
          {
            label: "1.1.0",
            leafs: []
          },
          {
            label: "1.1.1",
            leafs: []
          }
        ]
      }
    ]
  });
});

test("Request should use resolved value as url, when url is missing", async () => {
  const expected = {
    ok: true
  };

  nock("http://remote.test")
    .get("/source1")
    .reply(200, expected);

  const result = await dataPoint.resolve("request:a3.1", {});
  expect(result).toEqual(expected);
});

test("Entry#resolve - resolve request", async () => {
  const expected = {
    ok: true
  };

  nock("http://remote.test")
    .get("/source1")
    .reply(200, expected);

  const result = await dataPoint.resolve("entry:callRequest", {});
  expect(result).toEqual(expected);
});

test("Entry#resolve - request uses locals object", async () => {
  const expected = {
    ok: true
  };

  nock("http://remote.test")
    .get("/source1")
    .reply(200, expected);

  const options = {
    locals: {
      itemPath: "/source1"
    }
  };
  const result = await dataPoint.resolve(
    "entry:callDynamicRequestFromLocals",
    {},
    options
  );

  expect(result).toEqual(expected);
});

test("Entry#resolve - resolve hash with request", async () => {
  const expected = {
    ok: true
  };

  nock("http://remote.test")
    .get("/source1")
    .reply(200, expected);

  const result = await dataPoint.resolve("entry:hashThatCallsRequest", {});
  expect(result).toEqual(expected);
});

test("Entry#resolve - resolve hash with request and hash reducers", async () => {
  const expected = {
    newOk: "trueok",
    ok: true
  };

  nock("http://remote.test")
    .get("/source1")
    .reply(200, {
      ok: true
    });

  const result = await dataPoint.resolve(
    "entry:callHashWithRequestAndExtendResult",
    {}
  );

  expect(result).toEqual(expected);
});

test("Entry#resolve - resolve model with multiple sources", async () => {
  const expected = {
    s1: "source1",
    s2: "source2"
  };

  nock("http://remote.test")
    .get("/source1")
    .reply(200, {
      source: "source1"
    });

  nock("http://remote.test")
    .get("/source2")
    .reply(200, {
      source: "source2"
    });

  const result = await dataPoint.resolve(
    "entry:callHashThatCallsMultipleRequests",
    {}
  );

  expect(result).toEqual(expected);
});

test("Entry#resolve - resolve model with dynamic sources collection", async () => {
  const expected = [
    {
      result: "source2"
    },
    {
      result: "source3"
    }
  ];

  nock("http://remote.test")
    .get("/source1")
    .reply(200, {
      sources: [
        {
          itemPath: "/source2"
        },
        {
          itemPath: "/source3"
        }
      ]
    });

  nock("http://remote.test")
    .get("/source2")
    .reply(200, {
      result: "source2"
    });

  nock("http://remote.test")
    .get("/source3")
    .reply(200, {
      result: "source3"
    });

  const result = await dataPoint.resolve("entry:nestedRequests", {});
  expect(result).toEqual(expected);
});

test("Entry#resolve:middleware(entry:after) - gets called", async () => {
  const expected = {
    ok: true
  };

  nock("http://remote.test")
    .get("/source1")
    .reply(200, expected);

  dataPoint.middleware.clear();

  dataPoint.middleware.use("entry:after", (acc, next) => {
    expect(acc.context.id).toBe("entry:callRequest");
    next(null);
  });

  const result = await dataPoint.resolve("entry:callRequest", {});
  expect(result).toEqual(expected);
});

test("Entry#resolve - run schema, fail if invalid", async () => {
  await expect(
    dataPoint.resolve("schema:checkHashSchemaInvalid", TestData)
  ).rejects.toThrowErrorMatchingSnapshot();
});

test("Entry#resolve - run schema, pass value if valid", async () => {
  const result = await dataPoint.resolve(
    "schema:checkHashSchemaValid",
    TestData
  );
  expect(result).toBeTruthy();
});

test("Model Entity Instance", async () => {
  const model = Model("myModel", {
    value: value => value * 10
  });
  const result = await dataPoint.resolve(model, 10);
  expect(result).toEqual(100);
});

describe("trace feature", () => {
  let mockDateNow;
  let mockWriteFileP;
  let mockhrTime;
  afterEach(() => {
    mockDateNow.mockRestore();
    mockWriteFileP.mockRestore();
    mockhrTime.mockRestore();
  });

  test("trace via options parameter", async () => {
    let calls = 0;
    const NS_PER_SEC = 1e9;
    mockhrTime = jest.spyOn(process, "hrtime").mockImplementation(() => {
      calls += 1;
      return [calls, NS_PER_SEC * calls];
    });
    mockDateNow = jest.spyOn(Date, "now").mockImplementation(() => {
      return 123;
    });
    mockWriteFileP = jest
      .spyOn(TraceGraph, "writeFileP")
      .mockImplementation(() => {
        return Promise.resolve(true);
      });

    await dataPoint.resolve("model:tracedViaOptions", TestData, {
      trace: true
    });

    expect(mockWriteFileP.mock.calls).toMatchSnapshot();
  });

  test("trace via entity params", async () => {
    const consoleTime = console.time;
    const consoleTimeEnd = console.timeEnd;

    const timeIds = [];
    console.time = id => {
      timeIds.push({
        type: "time",
        id
      });
    };
    console.timeEnd = id => {
      timeIds.push({
        type: "timeEnd",
        id
      });
    };
    await dataPoint.resolve("model:tracedViaParams", TestData);
    console.time = consoleTime;
    console.timeEnd = consoleTimeEnd;
    const ids = _.map(timeIds, "id");
    expect(ids[0]).toContain("⧖ model:tracedViaParams:");
  });
});

describe("handle undefined value", () => {
  test("HashEntity - should throw error", async () => {
    await expect(dataPoint.resolve("hash:noValue", {})).rejects
      .toThrowErrorMatchingInlineSnapshot(`
"Entity type check failed!
Expected type: object
Actual type: string
Input value: 'invalid'"
`);
  });

  test("CollectionEntity - should throw error", async () => {
    await expect(dataPoint.resolve("collection:noValue", {})).rejects
      .toThrowErrorMatchingInlineSnapshot(`
"Entity type check failed!
Expected type: array
Actual type: string
Input value: 'invalid'"
`);
  });

  test("CollectionEntity - should ignore input", async () => {
    nock("http://remote.test")
      .get("/source1")
      .reply(200, {
        ok: true
      });
    const result = await dataPoint.resolve("request:a1", {});

    expect(result).toEqual({
      ok: true
    });
  });
});
